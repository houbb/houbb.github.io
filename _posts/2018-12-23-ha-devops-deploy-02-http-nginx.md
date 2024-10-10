---
layout: post
title: 高可用之应用发布？02-http 请求如何通过 nginx 实现负载？
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

# chat

## 如何通过 nginx，实现通过域名将 http 请求负载均衡指定 ip 列表

要通过 Nginx 实现基于域名的 HTTP 请求负载均衡到指定的 IP 列表，你可以按照以下步骤进行配置：

1. **定义 Upstream 服务器组**：
   在 Nginx 配置文件中定义一个 upstream 块，列出所有需要负载均衡的后端服务器 IP 地址和端口。可以使用权重（weight）、最大失败次数（max_fails）、失败超时（fail_timeout）等参数来控制负载均衡的行为。

   示例配置：
   ```nginx
   http {
       upstream myapp {
           server 192.168.1.100:80 weight=3;
           server 192.168.1.101:80 weight=2;
           server 192.168.1.102:80;
           server 192.168.1.103:80 backup;
       }
   }
   ```
   在这里，`weight` 参数指定了服务器的权重，`backup` 表示该服务器作为备份服务器，在其他服务器不可用时才会被使用。

2. **配置 Server 块**：
   在 Nginx 配置文件中为每个域名配置一个 server 块，使用 `server_name` 指令指定域名，并使用 `location` 块中的 `proxy_pass` 指令将请求转发到 upstream 服务器组。

   示例配置：
   ```nginx
   server {
       listen 80;
       server_name www.example.com;
       
       location / {
           proxy_pass http://myapp;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
   在这个配置中，所有发到 `www.example.com` 的请求都会被转发到定义在 upstream 块 `myapp` 中的服务器。

3. **启用健康检查**：
   Nginx 可以配置健康检查来自动检测后端服务器的状态，并在服务器不可用时将其从负载均衡中移除。

   示例配置：
   ```nginx
   upstream myapp {
       server 192.168.1.100:80 max_fails=3 fail_timeout=30s;
       server 192.168.1.101:80 max_fails=3 fail_timeout=30s;
   }
   ```
   在这里，`max_fails` 指定了在 `fail_timeout` 时间内允许的最大失败请求次数，超过这个次数后，Nginx 会认为服务器不可用。

4. **重新加载 Nginx 配置**：
   完成配置后，需要重新加载 Nginx 配置以使更改生效。
   ```
   sudo nginx -s reload
   ```

通过以上步骤，你可以实现通过 Nginx 将指定域名的 HTTP 请求负载均衡到一个 IP 列表。

这种方式可以提高网站的可用性和扩展性，同时通过健康检查确保用户请求不会发送到不可用的服务器 。

## 如何通过 nginx 动态实现域名和 ip 之间的映射？保证应用上下线流量无损？

要通过 Nginx 动态实现域名和 IP 之间的映射，并保证应用上下线流量无损，可以采取以下策略：

1. **使用 Nginx 的动态 DNS 解析**：
   Nginx 配置中的 `resolver` 指令允许指定一个 DNS 服务器，用于动态解析域名到 IP 地址。通过设置 `valid` 参数，可以指定 DNS 记录的有效期，这样 Nginx 会在请求时检查 DNS 记录是否过期，并在必要时重新解析。例如：
   ```
   resolver 10.0.0.2 valid=10s;
   server {
       location / {
           set $backend_servers backends.example.com;
           proxy_pass http://$backend_servers:8080;
       }
   }
   ```
   这样配置后，Nginx 会在 DNS 记录过期时重新解析域名，从而实现动态映射。

2. **利用 Nginx 的 Upstream 模块**：
   在 Upstream 中配置多个服务器，使用负载均衡算法（如 `least_conn`）来分发请求。同时，设置 `max_fails` 和 `fail_timeout` 来指定失败尝试的次数和超时时间，以确保请求不会发送到不可用的服务器。

3. **实现无损下线**：
   对于服务的下线，可以通过 Nginx 的健康检查模块 `nginx_upstream_check_module` 来实现。这个模块可以定期检查后端服务的健康状态，如果服务不健康，则自动将其从负载均衡中移除，直到服务恢复正常。

4. **灰度发布**：
   通过 Nginx 的负载均衡权重调节，可以实现灰度发布。例如，将新版本的服务权重设置较低，逐渐增加权重，从而逐渐将流量切换到新版本。

5. **使用 Lua 脚本**：
   结合 OpenResty（Nginx + Lua），可以编写 Lua 脚本来动态修改 Nginx 的配置，实现域名和 IP 之间的动态映射。这种方法提供了更高的灵活性，但也增加了复杂性。

6. **服务预热**：
   在应用上线前，可以通过发送模拟请求来预热特定的 URL，确保相关的资源和处理逻辑提前准备好，减少实际请求的响应时间。

7. **使用微服务治理工具**：
   如阿里云的 MSE 微服务引擎，提供了无损上下线的能力，包括服务预热、延迟下线等功能，以避免流量损失和请求超时。

8. **Nginx 版本平滑升级与回滚**：
   在升级 Nginx 版本时，可以平滑地回滚到旧版本，以确保服务的连续性。

通过上述方法，可以有效地实现域名和 IP 之间的动态映射，并确保在应用上下线过程中流量无损。

## 如何通过 lua 脚本动态修改 nginx 配置，实现域名和 ip 之间的映射？给出具体的例子

在 Nginx 中使用 Lua 脚本动态修改配置，通常涉及到 OpenResty，这是一个基于 Nginx 的平台，它集成了很多 Lua 库和第三方模块，使得 Lua 脚本能够更加方便地处理 HTTP 请求和响应。以下是使用 Lua 脚本动态修改 Nginx 配置以实现域名和 IP 之间映射的一个基本示例。

首先，确保你已经安装了 OpenResty，它包括了 Nginx 和 LuaJIT。然后，你可以使用 `lua-nginx-module` 提供的 `set` 指令在运行时动态设置变量，并通过 Lua 脚本来修改这些变量的值。

以下是一个简单的示例，展示了如何在 Nginx 配置中使用 Lua 脚本来动态设置 Upstream 服务器：

1. **Nginx 配置** (`nginx.conf`)：
```nginx
http {
    lua_shared_dict my_shared_dict 10m;

    server {
        listen 80;

        location / {
            set $upstream nil;

            # 通过 Lua 脚本动态设置 Upstream 服务器
            content_by_lua_block {
                local shared = ngx.shared.my_shared_dict
                local upstream_key = "upstream_servers"
                local upstream_servers = shared:get(upstream_key)

                if not upstream_servers then
                    upstream_servers = "server 192.168.1.100:80; server 192.168.1.101:80;"
                    shared:set(upstream_key, upstream_servers)
                end

                ngx.var.upstream = upstream_servers
            }

            proxy_pass http://$upstream;
        }
    }
}
```

2. **Lua 脚本修改 Upstream 配置**：
你可以编写一个外部 Lua 脚本来修改共享内存中的 Upstream 配置，并重新加载 Nginx 配置，而无需停止和启动 Nginx 服务。

```lua
local shared = require "resty.shared_dict".new("my_shared_dict", {storage = "memory", size = 10})

local upstream_key = "upstream_servers"
local new_upstream_servers = "server 192.168.1.102:80; server 192.168.1.103:80;"

-- 设置新的 Upstream 配置
shared:set(upstream_key, new_upstream_servers)

-- 重新加载 Nginx 配置（需要相应的权限）
os.execute("nginx -s reload")
```

在这个示例中，我们首先定义了一个共享内存区域 `my_shared_dict`，然后在 `location` 块中使用 `content_by_lua_block` 来运行 Lua 脚本。

Lua 脚本从共享内存中获取 Upstream 服务器的配置，如果不存在，则设置一个默认值。然后，我们将这个值赋给 `$upstream` 变量，这样 `proxy_pass` 指令就可以使用它来动态选择 Upstream 服务器。

请注意，这个示例仅用于演示目的，实际生产环境中的配置可能会更加复杂。

此外，直接通过 Lua 脚本修改 Nginx 配置并重新加载 Nginx 是一个高级操作，需要谨慎处理，以避免服务中断。

在实际应用中，可能需要结合具体的业务逻辑和需求来设计更合适的方案。

## lua 有没有简单的方式实现动态修改 nginx 配置重启？必须要依赖 OpenResty 吗

Lua 本身并没有直接修改 Nginx 配置并重启服务的能力，因为 Lua 是一种脚本语言，它的运行环境和权限通常被限制在特定的沙盒中。Nginx 的配置文件（nginx.conf）通常需要在 Nginx 进程外部被修改，并且需要有相应的权限来重启 Nginx 服务。

OpenResty 是一个基于 Nginx 的全功能 Web 平台，它集成了 LuaJIT、许多精心设计的 Nginx 模块，以及大量的 Lua 库。通过 OpenResty，你可以使用 Lua 脚本来动态地修改 Nginx 的配置，但这仍然需要通过调用外部命令或脚本来重启 Nginx 服务。

如果你不想依赖 OpenResty，你可以考虑以下几种方法来动态修改 Nginx 配置并重启服务：

1. **外部命令行工具**：
   编写一个 Lua 脚本，该脚本通过执行系统命令（如 `nginx -s reload`）来重启 Nginx。这通常需要在 Lua 脚本中使用 `os.execute()` 或 `io.popen()` 函数。

   ```lua
   os.execute("nginx -s reload")
   ```

   但是，这种方法需要 Lua 脚本有足够的权限来执行 Nginx 命令，并且可能会涉及到安全风险。

2. **信号处理**：
   在 Nginx 配置文件中使用 `include` 指令包含动态生成的配置片段。Lua 脚本可以生成这些配置片段，然后通过发送信号（如 `HUP`）来提示 Nginx 重新加载其配置。

   ```bash
   kill -HUP `cat /var/run/nginx.pid`
   ```

   这种方法不需要直接重启 Nginx，但需要 Nginx 配置文件正确设置以包含动态生成的配置片段。

3. **Nginx Plus**：
   如果你使用的是 Nginx Plus，它提供了动态配置的能力，包括通过 API 动态修改配置。你可以使用 Lua 脚本调用这些 API 来修改配置，然后通过 API 触发配置的重新加载。

4. **第三方模块**：
   有些第三方 Nginx 模块可能提供了动态配置的能力。这些模块可以被集成到 Nginx 中，并通过 Lua 脚本与之交互来实现配置的动态修改。

5. **自定义 Nginx 模块**：
   如果你有足够的资源和需求，可以开发一个自定义的 Nginx 模块，该模块提供了动态配置的接口。然后，你可以在 Lua 脚本中调用这些接口来修改配置。

总的来说，不依赖 OpenResty 来动态修改 Nginx 配置并重启服务是可能的，但通常需要额外的步骤和考虑安全性。

OpenResty 简化了这个过程，因为它已经集成了许多有用的模块和库。

在生产环境中，任何动态修改配置和重启服务的操作都应该非常谨慎，以避免服务中断。

# 参考资料

* any list
{:toc}