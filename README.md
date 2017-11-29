参考 [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin) 提供服务端页面模版生成的工具

## 安装
```
npm i spd-ssr-cli -g
// 注：工具发布在内部仓库，http://120.132.50.164:4873/
```

## Usage
```
Usage: spd-ssr <root-path> <dest-path> <routers.json>

Options:
    -i, --index <index>                     index page (default: index.html)
    -s, --static <static>                   resource dir (default: static)
    -r, --root-id <root-id>                 the root element id (default: app)
    -l, --lang [php|nodejs|$filepath|none]  dynamic data rendering engine support. (default: php)
                                            use "none" for none-dynamic data or define the render code in $filepath
    -t, --async-time <async-time>           get the page source after [async-time] milliseconds because of the async request (default: 100)
    -p, --port <port>                       port of inner www server (default: 3000)
    -h, --help                              output usage information
```
