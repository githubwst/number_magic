// svg-assets.js
// 终极还原：直接从您提供的《嗨道奇和制作音乐徽章.mp4》视频中提取的动态 GIF 原画！
// 我们将视频画面裁剪成了可爱的圆形徽章样式。

const SVGAssets = {
    // 角色 1 (视频原片片段 1)
    dog: `<img src="images/movie/char1.gif" alt="Char1" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid white; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));" />`,

    // 角色 2 (视频原片片段 2)
    cat: `<img src="images/movie/char2.gif" alt="Char2" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid white; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));" />`,

    // 角色 3 (视频原片片段 3)
    elephant: `<img src="images/movie/char3.gif" alt="Char3" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid white; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));" />`,

    // 角色 4 (视频原片片段 4)
    frog: `<img src="images/movie/char4.gif" alt="Char4" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid white; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));" />`,

    // 角色 5 (视频原片片段 5)
    duck: `<img src="images/movie/char5.gif" alt="Char5" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid white; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));" />`,

    // 默认备用 (星星)
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" style="filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.2));">
        <polygon points="50,10 61,40 95,40 68,60 78,90 50,70 22,90 32,60 5,40 39,40" fill="#ffd166"/>
        <circle cx="40" cy="50" r="4" fill="#333"/>
        <circle cx="60" cy="50" r="4" fill="#333"/>
        <path d="M45,60 Q50,70 55,60" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
};

// 预定义 1-20 的配置映射
// 数字越大，气球越小（避免屏幕放不下），颜色循环
const NumberConfig = [];
const colorPalette = [
    { bg: '#ff9a9e', border: '#ff7e84' }, // 粉
    { bg: '#fecfef', border: '#e8bce0' }, // 浅紫
    { bg: '#a1c4fd', border: '#8cb6f5' }, // 蓝
    { bg: '#9ae6b4', border: '#7cd99b' }, // 绿
    { bg: '#fdfd96', border: '#f6c764' }, // 黄
    { bg: '#ffb347', border: '#f99e2a' }, // 橙
    { bg: '#cbaacb', border: '#b08bb0' }, // 紫
    { bg: '#84fab0', border: '#6be69a' }, // 亮绿
    { bg: '#8fd3f4', border: '#73c3eb' }, // 亮蓝
    { bg: '#fccb90', border: '#f7b972' }, // 桃桃
];

const assetsList = ['elephant', 'duck', 'frog', 'cat', 'dog']; // 移除了 star 以确保和音效完全对应
// 音效将直接使用 assetKey，不需要单独的 audioList

for (let i = 1; i <= 20; i++) {
    // 每 5 个一个循环，颜色循环
    const colorIdx = (i - 1) % colorPalette.length;
    // 分配图标，循环分配以确保每个数字都有确定的图标和音效
    const assetKey = assetsList[(i - 1) % assetsList.length];

    // 气球尺寸：1-5 最大，后面逐渐缩小
    let size = 150;
    if (i > 5 && i <= 10) size = 120;
    if (i > 10 && i <= 15) size = 100;
    if (i > 15) size = 80;

    NumberConfig.push({
        num: i,
        color: colorPalette[colorIdx].bg,
        shadowColor: colorPalette[colorIdx].border,
        svg: SVGAssets[assetKey],
        soundKey: assetKey, // 直接绑定相同的 key
        size: size
    });
}
