package com.dmp.service;

import org.springframework.stereotype.Service;

/**
 * SQL prettify: formats SQL for display. Uses vertical-blank sql-formatter when available.
 */
@Service
public class SqlFormatterService {

    public String prettify(String sql) {
        if (sql == null || sql.isBlank()) {
            return sql;
        }
        try {
            return com.github.vertical_blank.sqlformatter.SqlFormatter.format(sql.trim());
        } catch (Exception e) {
            return sql;
        }
    }
}
