# 实际验证记录

验证日期：2026-10-27（Asia/Shanghai）。

- 引擎：Node.js 内置测试，**18 / 18 通过**。
- 页面：Playwright + Chromium Headless Shell 151，**33 / 33 通过**。
- 视觉：检查了桌面 1440px 和手机 390px 的真实渲染截图。
- 响应式：360px、390px、768px 与 1440px 页面没有横向溢出。
- 浏览器未捕获脚本错误：0；外部资源 / API 请求：0。

页面测试使用隔离的临时浏览器配置与测试存档。当前 macOS 沙箱不允许 Chromium 的多进程端口注册，因此此次验收采用单进程 headless 配置；交付的标准测试脚本使用常规 Chromium 启动方式。未测试 Safari、Firefox 或真实手机；音效已验证开关、设置持久化和 Web Audio 调用无错误，未进行人工听感评估。GitHub Pages 部署步骤已提供，本次没有创建远端仓库或发布站点。

## 页面检查

1. ✓ four initial item previews
2. ✓ lever draw animates and grants exactly one item
3. ✓ ten-pull UI + guarantee
4. ✓ ten-pull detail returns to all results
5. ✓ 76 collection slots
6. ✓ rarity filter
7. ✓ owned-only filter
8. ✓ owned-name search
9. ✓ empty search state
10. ✓ 12 achievement progress cards
11. ✓ sound toggle
12. ✓ reduced animation saved
13. ✓ reload restores inventory and settings
14. ✓ history lists 11 acquired items
15. ✓ JSON export download
16. ✓ reset cancellation preserves state
17. ✓ confirmed reset clears test progress
18. ✓ JSON import restores exported progress
19. ✓ invalid import keeps current save
20. ✓ seven-click logo easter egg
21. ✓ secret reward not duplicated
22. ✓ footer easter egg
23. ✓ Konami easter egg
24. ✓ 390px mobile has no horizontal overflow
25. ✓ mobile instructions reachable
26. ✓ mobile collection has no overflow
27. ✓ mobile achievements have no overflow
28. ✓ 768px tablet no overflow
29. ✓ 360px narrow mobile no overflow
30. ✓ night egg does not overwrite ten-pull results
31. ✓ night egg reveals after closing batch
32. ✓ no uncaught browser errors
33. ✓ no external asset/API requests

## 引擎检查

覆盖基础概率边界、60 抽传说保底、十连保底、不可变状态更新、重复收藏、200 条历史上限、彩蛋去重、成就进度、JSON 往返、损坏存档保护与导入数据一致性。

## 复验

运行 `npm test` 验证引擎；完整页面回归命令见 README 的“验证”部分。
