/**
 * 复制
 * https://blog.csdn.net/qq_36509946/article/details/123583237
 *
 * @param data 数据
 */
 function copy(data)
 {
     const url = data;
     const oInput = document.createElement('input');
     oInput.value = url;
     document.body.appendChild(oInput);
     oInput.select(); // 选择对象;
     document.execCommand('Copy'); // 执行浏览器复制命令
     oInput.remove()
 };