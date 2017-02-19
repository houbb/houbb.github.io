# 三范式

第一范式(1NF):字段具有原子性,不可再分。所有关系型数据库系统都满足第一范式)
数据库表中的字段都是单一属性的,不可再分。例如,姓名字段,其中的姓和名必 须作为一个整体,无法区分哪部分是姓,哪部分是名,如果要区分出姓和名,必须设计成两 个独立的字段。


第二范式(2NF):
第二范式(2NF)是在第一范式(1NF)的基础上建立起来的,即满足第二范式(2NF)必 须先满足第一范式(1NF)。
要求数据库表中的每个实例或行必须可以被惟一地区分。通常需要为表加上一个列,以存储 各个实例的惟一标识。这个惟一属性列被称为主关键字或主键。


第二范式(2NF)要求实体的属性完全依赖于主关键字。所谓完全依赖是指不能存在仅依赖 主关键字一部分的属性,如果存在,那么这个属性和主关键字的这一部分应该分离出来形成 一个新的实体,新实体与原实体之间是一对多的关系。
为实现区分通常需要为表加上一个列, 以存储各个实例的惟一标识。简而言之,第二范式就是非主属性非部分依赖于主关键字。


第三范式的要求如下:
满足第三范式(3NF)必须先满足第二范式(2NF)。简而言之,第三范式(3NF)要求一 个数据库表中不包含已在其它表中已包含的非主关键字信息。
所以第三范式具有如下特征:

1,每一列只有一个值
2,每一行都能区分。
3,每一个表都不包含其他表已经包含的非主关键字信息。



# union _ union all


1) UNION 进行表链接后会筛选掉重复的记录。

2) UNION ALL 只是简单的将两个结果合并后就返回。这样,如果返回的两个结果集中有 重复的数据,那么返回的结果集就会包含重复的数据了。

UNION 在进行表链接后会筛选掉重复的记录,所以在表链接后会对所产生的结果集进行排 序运算,删除重复的记录再返回结果。实际大部分应用中是不会产生重复的记录,最常见的 是过程表与历史表 UNION。如:

select * from gc_dfys
union
select * from ls_jg_dfys

这个 SQL 在运行时先取出两个表的结果,再用排序空间进行排序删除重复的记录,最 后返回结果集,如果表数据量大的话可能会导致用磁盘进行排序。
而 UNION ALL 只是简单的将两个结果合并后就返回。这样,如果返回的两个结果集中有 重复的数据,那么返回的结果集就会包含重复的数据了。
从效率上说,UNION ALL 要比 UNION 快很多,所以,如果可以确认合并的两个结果集 中不包含重复的数据的话,那么就使用 UNION ALL





# 分页

取出 sql 表中第31到40的记录(以自动增长 ID 为主键) sql server 方案1:
selecttop 10 * from t where id not in (select top 30 id from t order by id ) orde byid sql server 方案2:
selecttop 10 * from t where id in (select top 40 id from t order by id) order by iddesc mysql 方案:select * from t order by idlimit 30,10
 oracle 方案:select * from (select rownum r,* from t where r<=40) wherer>30
--------------------待整理进去的内容------------------------------------- pageSize=20;
pageNo = 5;
1.分页技术1(直接利用 sql 语句进行分页,效率最高和最推荐的)
mysql:sql = "select * from articles limit " +(pageNo-1)*pageSize + "," + pageSize;
oracle: sql = "select * from " +
articles order by postime desc)" +
pageNo*pageSize +") tmp " +
"(selectrownum r,* from " + "(select* from
"whererownum<= " + "wherer>" +
(pageNo-1)*pageSize;
注释:第7行保证 rownum 的顺序是确定的,因为 oracle 的索引会造成 rownum 返回不同的
值
简洋 示:没有 order by 时,rownum 按顺序输出,一旦有了 order by,rownum 不按顺序 输出了,这说明 rownum 是排序前的编号。如果对 order by 从句中的字段建立了索引,那 么,rownum 也是按顺序输出的,因为这时候生成原始的查询结果集时会参照索引表的顺序 来构建。
sqlserver:sql = "select top 10 * from id not id(select top" + (pageNo-1)*pageSize + "id from articles)"
DataSource ds = new InitialContext().lookup(jndiurl); Connection cn = ds.getConnection();
//"select * from user where id=?" --->binary directive PreparedStatement pstmt = cn.prepareSatement(sql); ResultSet rs = pstmt.executeQuery()
 while(rs.next()) {
out.println(rs.getString(1)); }
2.不可滚动的游标 pageSize=20; pageNo = 5;
cn = null
stmt = null;
rs = null;
try
{
sqlserver:sql = "select * from articles";
DataSource ds = new InitialContext().lookup(jndiurl); Connection cn = ds.getConnection();
//"select * from user where id=?" --->binary directive PreparedStatement pstmt = cn.prepareSatement(sql); ResultSet rs = pstmt.executeQuery()
for(int j=0;j<(pageNo-1)*pageSize;j++) {
rs.next(); }
int i=0;
while(rs.next() && i<10) {
i++; out.println(rs.getString(1));
 }
} cacth(){} finnaly
{
if(rs!=null)try{rs.close();}catch(Exceptione){} if(stm.........
if(cn............
}
3.可滚动的游标 pageSize=20; pageNo = 5;
cn = null
stmt = null;
rs = null;
try
{
sqlserver:sql = "select * from articles";
DataSource ds = new InitialContext().lookup(jndiurl);
Connection cn = ds.getConnection();
//"select * from user where id=?" --->binary directive
PreparedStatement pstmt = cn.prepareSatement(sql,ResultSet.TYPE_SCROLL_INSENSITIVE,...);
//根据上面这行代码的异常 SQLFeatureNotSupportedException,就可判断驱动是否支持可 滚动游标
ResultSet rs = pstmt.executeQuery() rs.absolute((pageNo-1)*pageSize) int i=0;
while(rs.next() && i<10) {
i++;
out.println(rs.getString(1)); }
} cacth(){} finnaly
{
if(rs!=null)try{rs.close();}catch(Exceptione){} if(stm.........
if(cn............
}




答:最好的办法是利用 sql 语句进行分页,这样每次查询出的结果集中就只包含某页的数据 内容。再 sql 语句无法实现分页的情况下,可以考虑对大的结果集通过游标定位方式来获取 某页的数据。
sql 语句分页,不同的数据库下的分页方案各不一样,下面是主流的三种数据库的分页 sql: sql server:
String sql =
"select top" + pageSize + " * from students where id not in" +
"(select top "+ pageSize * (pageNumber-1) + " id from students order by id)" +
"order by id"; mysql:
String sql =
"select * fromstudents order by id limit " + pageSize*(pageNumber-1) + "," +pageSize;
oracle:
String sql =
"select * from " +
(select *,rownum rid from (select * fromstudents order by postime desc) where rid<=" + pagesize*pagenumber +") as t" +
"where t>" +pageSize*(pageNumber-1);
