#!/usr/bin/env python3
"""
GitHub Issues 同步到微信公众号
"""

import os
import re
import json
import requests
from datetime import datetime
from pathlib import Path
from wechatpy import WeChatClient
import markdown
import yaml

class GitHubIssueSyncer:
    def __init__(self, config):
        self.github_token = config['github_token']
        self.repo_owner = config['repo_owner']
        self.repo_name = config['repo_name']
        self.sync_label = config.get('sync_label', 'wechat-publish')
        self.state_file = Path(config.get('state_file', '.sync_state.json'))
        
        # 微信配置
        self.wechat_appid = config['wechat_appid']
        self.wechat_secret = config['wechat_secret']
        self.wechat_client = WeChatClient(self.wechat_appid, self.wechat_secret)
        
        # 加载同步状态
        self.synced_issues = self._load_state()
    
    def _load_state(self):
        if self.state_file.exists():
            with open(self.state_file) as f:
                return json.load(f)
        return {}
    
    def _save_state(self):
        with open(self.state_file, 'w') as f:
            json.dump(self.synced_issues, f, indent=2)
    
    def _github_headers(self):
        return {
            'Authorization': f'token {self.github_token}',
            'Accept': 'application/vnd.github.full+json'
        }
    
    def get_issues_to_sync(self):
        url = f"https://api.github.com/repos/{self.repo_owner}/{self.repo_name}/issues"
        params = {
            'state': 'open',
            'labels': self.sync_label,
            'per_page': 100,
            'sort': 'created',
            'direction': 'desc'
        }
        
        response = requests.get(url, headers=self._github_headers(), params=params)
        response.raise_for_status()
        
        issues = response.json()
        
        # 过滤出未同步或已更新的 Issues
        to_sync = []
        for issue in issues:
            issue_number = str(issue['number'])
            updated_at = issue['updated_at']
            
            if issue_number not in self.synced_issues:
                to_sync.append(issue)
            elif self.synced_issues[issue_number].get('updated_at') != updated_at:
                to_sync.append(issue)
        
        return to_sync
    
    def parse_issue(self, issue):
        body = issue.get('body', '') or ''
        title = issue.get('title', '')
        
        frontmatter = {}
        content = body
        
        if body.startswith('---'):
            parts = body.split('---', 2)
            if len(parts) >= 3:
                try:
                    frontmatter = yaml.safe_load(parts[1]) or {}
                except:
                    pass
                content = parts[2].strip()
        
        return {
            'number': issue['number'],
            'title': frontmatter.get('title', title),
            'author': frontmatter.get('author', issue.get('user', {}).get('login', '')),
            'digest': frontmatter.get('description', self._extract_digest(content)),
            'cover': frontmatter.get('cover', self._extract_first_image(content)),
            'content': content,
            'labels': [l['name'] for l in issue.get('labels', [])],
            'created_at': issue.get('created_at', ''),
            'updated_at': issue.get('updated_at', ''),
            'url': issue.get('html_url', '')
        }
    
    def _extract_digest(self, content, max_length=120):
        text = re.sub(r'[#*`\[\]!]', '', content)
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:max_length] + '...' if len(text) > max_length else text
    
    def _extract_first_image(self, content):
        pattern = r'!\[.*?\]\((.*?)\)'
        matches = re.findall(pattern, content)
        return matches[0] if matches else None
    
    def download_image(self, url):
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        if 'github.com' in url and '/blob/' in url:
            url = url.replace('github.com', 'raw.githubusercontent.com')
            url = url.replace('/blob/', '/')
        
        response = requests.get(url, headers=headers, timeout=30)
        return response.content
    
    def process_images(self, content):
        pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        
        def replace_image(match):
            alt_text = match.group(1)
            image_url = match.group(2)
            
            if 'mmbiz.qpic.cn' in image_url:
                return match.group(0)
            
            try:
