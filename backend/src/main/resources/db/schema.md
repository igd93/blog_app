#Users Table

- id (UUID, primary key)
- username (unique)
- email (unique)
- password_hash
- full_name
- bio
- avatar_url
- created_at
- updated_at

#Blog Posts Table

- id (UUID, primary key)
- title
- slug (unique URL-friendly version of title)
- description
- content (CLOB - large text)
- author_id (foreign key → users.id)
- status (e.g., draft, published)
- post_date
- read_time
- created_at
- updated_at

#Comments Table

- id (UUID, primary key)
- post_id (foreign key → blog_posts.id)
- user_id (foreign key → users.id)
- content
- created_at
- updated_at

Tags System
tags:

- id (UUID, primary key)
- name (unique)
- slug (unique URL-friendly version)

post_tags (junction table):

- post_id (foreign key → blog_posts.id)
- tag_id (foreign key → tags.id)
- Combined primary key (post_id, tag_id)
