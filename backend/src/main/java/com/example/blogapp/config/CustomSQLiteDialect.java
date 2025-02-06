package com.example.blogapp.config;

import org.hibernate.dialect.SQLiteDialect;

public class CustomSQLiteDialect extends SQLiteDialect {
    public CustomSQLiteDialect() {
        super();
    }
}