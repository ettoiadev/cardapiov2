/**
 * Sistema de logs estruturados para debugging e monitoramento
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  metadata?: Record<string, any>
  error?: Error
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private isDevelopment = process.env.NODE_ENV === 'development'

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      metadata,
      error
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log no console em desenvolvimento
    if (this.isDevelopment) {
      this.logToConsole(entry)
    }
  }

  private logToConsole(entry: LogEntry) {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`
    const contextStr = entry.context ? ` [${entry.context}]` : ''
    const message = `${prefix}${contextStr}: ${entry.message}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.metadata)
        break
      case LogLevel.INFO:
        console.info(message, entry.metadata)
        break
      case LogLevel.WARN:
        console.warn(message, entry.metadata)
        break
      case LogLevel.ERROR:
        console.error(message, entry.metadata, entry.error)
        break
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    this.addLog(this.createLogEntry(LogLevel.DEBUG, message, context, metadata))
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    this.addLog(this.createLogEntry(LogLevel.INFO, message, context, metadata))
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    this.addLog(this.createLogEntry(LogLevel.WARN, message, context, metadata))
  }

  error(message: string, context?: string, metadata?: Record<string, any>, error?: Error) {
    this.addLog(this.createLogEntry(LogLevel.ERROR, message, context, metadata, error))
  }

  // Métodos específicos para contextos comuns
  supabase = {
    query: (table: string, operation: string, metadata?: Record<string, any>) => {
      this.debug(`Executando ${operation} na tabela ${table}`, 'SUPABASE', metadata)
    },
    success: (table: string, operation: string, metadata?: Record<string, any>) => {
      this.info(`${operation} em ${table} executado com sucesso`, 'SUPABASE', metadata)
    },
    error: (table: string, operation: string, error: any, metadata?: Record<string, any>) => {
      this.error(`Erro em ${operation} na tabela ${table}`, 'SUPABASE', {
        ...metadata,
        errorCode: error?.code,
        errorMessage: error?.message
      }, error instanceof Error ? error : new Error(String(error)))
    }
  }

  auth = {
    attempt: (email: string) => {
      this.info(`Tentativa de login`, 'AUTH', { email })
    },
    success: (email: string, adminId: string) => {
      this.info(`Login realizado com sucesso`, 'AUTH', { email, adminId })
    },
    failure: (email: string, reason: string) => {
      this.warn(`Falha no login`, 'AUTH', { email, reason })
    },
    logout: (adminId: string) => {
      this.info(`Logout realizado`, 'AUTH', { adminId })
    }
  }

  api = {
    request: (endpoint: string, method: string, metadata?: Record<string, any>) => {
      this.debug(`${method} ${endpoint}`, 'API', metadata)
    },
    response: (endpoint: string, method: string, status: number, metadata?: Record<string, any>) => {
      const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
      this.addLog(this.createLogEntry(level, `${method} ${endpoint} - ${status}`, 'API', metadata))
    },
    error: (endpoint: string, method: string, error: any, metadata?: Record<string, any>) => {
      this.error(`Erro em ${method} ${endpoint}`, 'API', metadata, error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Métodos para recuperar logs
  getLogs(level?: LogLevel, context?: string, limit?: number): LogEntry[] {
    let filteredLogs = this.logs

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level)
    }

    if (context) {
      filteredLogs = filteredLogs.filter(log => log.context === context)
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit)
    }

    return filteredLogs
  }

  getErrorLogs(limit = 50): LogEntry[] {
    return this.getLogs(LogLevel.ERROR, undefined, limit)
  }

  getRecentLogs(minutes = 10): LogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.logs.filter(log => new Date(log.timestamp) > cutoff)
  }

  // Exportar logs para debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Limpar logs
  clearLogs() {
    this.logs = []
  }

  // Estatísticas dos logs
  getStats(): Record<LogLevel, number> {
    const stats = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0
    }

    this.logs.forEach(log => {
      stats[log.level]++
    })

    return stats
  }
}

// Instância singleton
export const logger = Logger.getInstance()

// Funções de conveniência
export const log = {
  debug: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.debug(message, context, metadata),
  info: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.info(message, context, metadata),
  warn: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.warn(message, context, metadata),
  error: (message: string, context?: string, metadata?: Record<string, any>, error?: Error) => 
    logger.error(message, context, metadata, error),
  
  // Contextos específicos
  supabase: logger.supabase,
  auth: logger.auth,
  api: logger.api
}