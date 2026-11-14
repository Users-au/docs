import { defineConfig } from 'vitepress'

const english = {
  guide: 'Get started',
  integrate: 'Integrations',
  admin: 'Project administration',
  protocol: 'OAuth & OpenID Connect',
  api: 'API reference',
  identity: 'Profiles & preferences',
}

const chinese = {
  guide: '快速开始',
  integrate: '应用接入',
  admin: '项目管理',
  protocol: 'OAuth 与 OpenID Connect',
  api: 'API 参考',
  identity: '资料与界面偏好',
}

function navigation(prefix, labels, website) {
  return {
    nav: [
      { text: labels.guide, link: `${prefix}/guide/getting-started` },
      { text: labels.integrate, link: `${prefix}/integrations/` },
      { text: website, link: 'https://users.au' },
    ],
    sidebar: [
      {
        text: labels.guide,
        items: [
          { text: labels.guide, link: `${prefix}/guide/getting-started` },
          { text: labels.admin, link: `${prefix}/guide/project-admin` },
          { text: labels.protocol, link: `${prefix}/guide/oauth-oidc` },
          { text: labels.api, link: `${prefix}/guide/api-reference` },
          { text: labels.identity, link: `${prefix}/guide/profiles-preferences` },
        ],
      },
      {
        text: labels.integrate,
        items: [
          { text: labels.integrate, link: `${prefix}/integrations/` },
          { text: 'Frontend Client', link: `${prefix}/integrations/frontend-client` },
          { text: 'Laravel Client', link: `${prefix}/integrations/laravel-client` },
          { text: 'Laravel Socialite', link: `${prefix}/integrations/socialite-provider` },
          { text: 'Laravel Starter Kit', link: `${prefix}/integrations/laravel-starter-kit` },
          { text: 'Next.js Starter Kit', link: `${prefix}/integrations/nextjs-starter-kit` },
          { text: 'Synology DSM', link: `${prefix}/integrations/synology-dsm` },
        ],
      },
    ],
  }
}

export default defineConfig({
  title: 'Users.au Docs',
  description: 'Set up Users.au, manage sign-in, and connect applications with OAuth 2.0 and OpenID Connect.',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['README.md', 'integrations/synology-dsm.zh-CN.md'],
  sitemap: { hostname: 'https://docs.users.au' },
  head: [['meta', { name: 'theme-color', content: '#264ed8' }]],
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/Users-au/docs' }],
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详细结果',
                resetButtonTitle: '清除搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有结果',
                footer: {
                  selectText: '打开',
                  navigateText: '浏览',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
    editLink: {
      pattern: 'https://github.com/Users-au/docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
  },
  locales: {
    root: { label: 'English', lang: 'en-AU', themeConfig: navigation('', english, 'Users.au') },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Users.au 文档',
      description: '配置 Users.au 登录，通过 OAuth 2.0 和 OpenID Connect 接入应用。',
      themeConfig: {
        ...navigation('/zh', chinese, 'Users.au 官网'),
        editLink: {
          pattern: 'https://github.com/Users-au/docs/edit/main/:path',
          text: '在 GitHub 上编辑此页',
        },
        outline: { label: '本页内容' },
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdated: { text: '最后更新' },
        returnToTopLabel: '返回顶部',
        sidebarMenuLabel: '目录',
        langMenuLabel: '切换语言',
        darkModeSwitchLabel: '外观',
      },
    },
  },
})
