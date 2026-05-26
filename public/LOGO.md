# OortAPI Brand Logos

## 目录结构

```
public/
├── logo.svg                  # 默认 logo（亮色 + 文字，fallback）
├── logo-dark.svg             # 深色背景用（暗黑 + 文字）
├── logo-icon.svg             # 默认图标（亮色，方形）
├── logo-icon-dark.svg        # 深色背景用图标（暗黑，方形）
│
└── logos/                    # 第三方工具 logo
    ├── openai-codex.svg
    ├── claude-code.svg
    └── ...
```

## 命名规范

| 文件 | 尺寸 | 适用场景 |
|------|------|---------|
| `logo.svg` | 450×120 | 亮色背景 + 品牌文字，默认使用 |
| `logo-dark.svg` | 450×120 | 暗黑背景 + 品牌文字 |
| `logo-icon.svg` | 正方形 | 亮色背景，仅图标（favicon、小尺寸） |
| `logo-icon-dark.svg` | 正方形 | 暗黑背景，仅图标 |

### 黑白预留（印刷/灰度场景）

| 文件 | 说明 |
|------|------|
| `logo-bw.svg` | 黑白 + 文字，亮色背景 |
| `logo-bw-dark.svg` | 黑白 + 文字，暗黑背景 |
| `logo-icon-bw.svg` | 黑白图标，方形 |
| `logo-icon-bw-dark.svg` | 黑白图标，方形，暗黑背景 |

## 使用方式

### React / Next.js

```tsx
// 导航栏/页头
import Image from "next/image";

// 自动适配主题
<Image
  src={isDark ? "/logo-dark.svg" : "/logo.svg"}
  alt="OortAPI"
  width={450}
  height={120}
  className="h-8 w-auto"
/>

// 仅图标（移动端、favicon）
<Image
  src={isDark ? "/logo-icon-dark.svg" : "/logo-icon.svg"}
  alt="OortAPI"
  width={32}
  height={32}
/>
```

### HTML

```html
<!-- 亮色背景 -->
<img src="/logo.svg" alt="OortAPI" height="32" />

<!-- 暗黑背景 -->
<img src="/logo-dark.svg" alt="OortAPI" height="32" />
```

### Favicon

```html
<link rel="icon" href="/logo-icon.svg" type="image/svg+xml" />
```
