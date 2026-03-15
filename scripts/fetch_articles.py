#!/usr/bin/env python3
import os
import requests
import feedparser
import json
from datetime import datetime

# ========== 配置 ==========
RSS_FEEDS = [
    'https://www.36kr.com/feed',
    'https://www.ruanyifeng.com/blog/atom.xml',
    'https://www.zhihu.com/rss',
    # 在这里添加更多你喜欢的 RSS 源
]

API_URL = os.environ.get('BLOG_API_URL')
USERNAME = os.environ.get('ADMIN_USERNAME')
PASSWORD = os.environ.get('ADMIN_PASSWORD')

# 如果需要先登录获取 session_id，请先定义登录接口
LOGIN_API_URL = 'https://sibylpetal.sunny081209.cc/api/login'   # 你的登录 API 地址

# 为了避免重复发布相同的文章，可以记录已处理的文章链接（可选）
# 这里为了简化，每次运行都会尝试创建新文章（API 可能根据 slug 防重）

# ========== 工具函数：登录并获取 Cookie ==========
def login_and_get_session():
    """返回一个 requests.Session 对象，已带有登录 Cookie"""
    session = requests.Session()
    login_resp = session.post(LOGIN_API_URL, json={
        'username': USERNAME,
        'password': PASSWORD
    })
    if login_resp.status_code != 200:
        print(f"登录失败: {login_resp.text}")
        return None
    return session

# ========== 从 RSS 源获取文章 ==========
def fetch_articles_from_feed(feed_url):
    feed = feedparser.parse(feed_url)
    articles = []
    # 每个源取最新的 3 篇，避免一次发布太多
    for entry in feed.entries[:3]:
        articles.append({
            'title': entry.title,
            'description': entry.description if 'description' in entry else entry.summary,
            'link': entry.link,
            'published': entry.published if 'published' in entry else ''
        })
    return articles

# ========== 发布文章到博客 ==========
def publish_article(session, title, content, tags=''):
    """调用博客 API 创建文章，存为草稿（is_published=0）"""
    # 构造文章数据
    article_data = {
        'title': title,
        'content': content,
        'excerpt': content[:150] + '...' if len(content) > 150 else content,
        'tags': tags,
        # 如果 API 支持自动生成 slug，则无需提供；否则你可能需要生成一个基于标题的 slug
        # 'slug': None  # 留空让后端自动生成
    }
    # 注意：API 可能需要使用 FormData，这里假设是 JSON
    response = session.post(API_URL, json=article_data)
    if response.status_code == 200:
        print(f"文章创建成功: {title}")
    else:
        print(f"创建失败 {title}: {response.text}")

# ========== 主函数 ==========
def main():
    # 登录获取带 Cookie 的 session
    session = login_and_get_session()
    if not session:
        return

    for feed_url in RSS_FEEDS:
        print(f"处理源: {feed_url}")
        articles = fetch_articles_from_feed(feed_url)
        for art in articles:
            # 构建文章内容，并添加原文链接
            content = art['description']
            # 添加原文链接和版权声明
            content += f'\n\n<hr><p><i>本文转载自 <a href="{art["link"]}" target="_blank">{art["link"]}</a>，仅供学习交流，版权归原作者所有。</i></p>'

            # 从标题或内容中提取简单标签（示例）
            tags = '科技' if '科技' in art['title'] else '其他'

            # 发布为草稿
            publish_article(session, art['title'], content, tags)

if __name__ == '__main__':
    main()
