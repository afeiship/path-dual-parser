# requirements

## details
> 开发一个轻量前端TS工具，路由路径匹配，同时兼容两种参数语法：
- 语法1：/path/:id （path‑to‑regexp冒号风格）
- 语法2：/path/{id} （URI‑Template大括号OpenAPI风格）

### 要求：
1. 基于path‑to‑regexp做封装，不重复造轮子；
2. 对外提供match、compile两个核心API；
3. 输入模板无论是 :param 还是 {param} 都能正常匹配路径、解析params；
4. compile编译生成url时，两种模板都可以填充参数输出正确url；
5. TypeScript完整类型，params自动推导；
6. 浏览器+node双环境可用，ESM，体积小；
7. 写简单单元测试示例，演示两种语法的match和compile；
8. 不要新增复杂依赖，仅依赖path‑to‑regexp。
9. 我最终会发布到 npm 上管理，请确保代码规范、可读性、可维护性。
10. tests目录使用名称 `__tests__`
