// 拦截广告图片请求并返回空白响应体
$done({response: {status: 200, body: ''}});