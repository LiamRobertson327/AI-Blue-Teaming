/**
 * =============================================================================
 * ADMIN LOGS PAGE
 * =============================================================================
 * Displays workflow logs from Grafana Loki for administrators.
 * 
 * Features:
 * - Real-time log viewing
 * - Filter by workflow, node, event type
 * - Search logs
 * - Auto-refresh capability
 * =============================================================================
 */

import React, { useEffect, useState, useCallback } from "react";
import { MainLayout } from "../../layouts/MainLayout";
import "../../styles/Dashboard.css";
import "../../styles/Logs.css";

/**
 * Log entry interface matching the Loki stream format
 */
interface LogEntry {
  timestamp: string;
  message: string;
  workflow: string;
  node: string;
  eventType: string;
  executionId: string;
  userId: string;
}

/**
 * Loki query response format
 */
interface LokiResponse {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      stream: {
        workflow?: string;
        node?: string;
        event_type?: string;
        execution_id?: string;
        user_id?: string;
      };
      values: Array<[string, string]>;
    }>;
  };
}

// Loki endpoint - using nginx proxy with CORS enabled
const LOKI_PROXY_URL = "http://localhost:3101"; // Nginx proxy with CORS
// Auth token not needed for local Loki access via nginx proxy

/**
 * LogsPage - Admin page for viewing workflow logs
 */
export function LogsPage(): JSX.Element {
  // === State ===
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("1h");

  // Get unique workflows and event types for filters
  const workflows = Array.from(new Set(logs.map(log => log.workflow))).filter(Boolean);
  const eventTypes = Array.from(new Set(logs.map(log => log.eventType))).filter(Boolean);

  /**
   * Fetch logs from Loki
   */
  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      
      // Calculate time range
      const now = Date.now();
      const timeRangeMs = {
        "15m": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "6h": 6 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
      }[timeRange] || 60 * 60 * 1000;

      const start = (now - timeRangeMs) * 1000000; // Convert to nanoseconds
      const end = now * 1000000;

      // Build Loki queries - need separate queries for different label sets
      const queries = selectedWorkflow !== "all" 
        ? [`{workflow="${selectedWorkflow}"}`]
        : ['{workflow=~".+"}', '{job="n8n-logs"}']; // Custom workflow logs + n8n system logs

      let allResults: any[] = [];

      // Fetch from each query
      for (const query of queries) {
        const url = `${LOKI_PROXY_URL}/loki/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&limit=250`;
        
        const response = await fetch(url);
        
        const responseText = await response.text();
        console.log("Loki response status:", response.status, "for query:", query);

        if (response.ok && responseText) {
          try {
            const data = JSON.parse(responseText);
            if (data.data?.result) {
              allResults = allResults.concat(data.data.result);
            }
          } catch (e) {
            console.error("Failed to parse response for query:", query);
          }
        }
      }

      // Create a mock data structure for parsing
      const data: LokiResponse = {
        status: "success",
        data: {
          resultType: "streams",
          result: allResults
        }
      };

      // Parse logs from Loki response
      const parsedLogs: LogEntry[] = [];
      
      if (data.data?.result) {
        data.data.result.forEach(stream => {
          stream.values.forEach(([timestamp, rawMessage]) => {
            // Try to parse the message as JSON (n8n logs are JSON formatted)
            let message = rawMessage;
            let level = "info";
            let metadata: any = {};
            
            try {
              const parsed = JSON.parse(rawMessage);
              message = parsed.message || rawMessage;
              level = parsed.level || "info";
              metadata = parsed.metadata || {};
            } catch {
              // Not JSON, use raw message
            }

            parsedLogs.push({
              timestamp: new Date(parseInt(timestamp) / 1000000).toISOString(),
              message: message,
              workflow: stream.stream.workflow || metadata.file || "n8n",
              node: stream.stream.node || metadata.function || "",
              eventType: stream.stream.event_type || level,
              executionId: stream.stream.execution_id || metadata.executionId || "",
              userId: stream.stream.user_id || metadata.userId || "",
            });
          });
        });
      }

      // Sort by timestamp descending (newest first)
      parsedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(parsedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedWorkflow]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchLogs]);

  /**
   * Filter logs based on search and filters
   */
  const filteredLogs = logs.filter(log => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        log.message.toLowerCase().includes(query) ||
        log.workflow.toLowerCase().includes(query) ||
        log.node.toLowerCase().includes(query) ||
        log.executionId.toLowerCase().includes(query) ||
        log.userId.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Event type filter
    if (selectedEventType !== "all" && log.eventType !== selectedEventType) {
      return false;
    }

    return true;
  });

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  /**
   * Security threat tags that should be highlighted in red/danger style
   * Note: Only match when it's an ACTUAL threat detection, not "not detected"
   */
  const SECURITY_THREAT_TAGS = [
    "injection detected",
    "injection_detected",
    "prompt injection",
    "prompt_injection",
    "filtering detected",
    "blacklisted",
    "blacklist",
    "blacklisted_word",
    "blacklisted word",
    "bad_prompt",
    "bad prompt",
    "malicious",
    "blocked",
    "threat detected",
    "security_alert",
    "flagged_dangerous",
    "vulnerability",
    "exploit",
    "attack",
  ];

  /**
   * Check if event type is a security threat
   * Excludes "not detected" or "no ... detected" patterns
   */
  const isSecurityThreat = (eventType: string): boolean => {
    const type = eventType.toLowerCase();
    
    // If it says "not detected", "no prompt", "no filtering", "safe" - it's NOT a threat
    if (type.includes("not detected") || type.includes("no prompt") || type.includes("not_detected") || 
        type.includes("no filtering") || type.includes("safe model") || type.includes("passed")) {
      return false;
    }
    
    // Check for actual threat patterns
    return SECURITY_THREAT_TAGS.some(tag => type.includes(tag));
  };

  /**
   * Get display label for security tags (more readable)
   */
  const getSecurityTagLabel = (eventType: string): string => {
    const type = eventType.toLowerCase();
    
    // Skip if not a real threat
    if (type.includes("not detected") || type.includes("no prompt") || type.includes("not_detected") ||
        type.includes("no filtering") || type.includes("safe model") || type.includes("passed")) {
      return eventType.toUpperCase();
    }
    
    if (type.includes("prompt injection") || type.includes("prompt_injection") || 
        type.includes("injection detected") || type.includes("filtering detected")) {
      return "⚠️ PROMPT INJECTION DETECTED";
    }
    if (type.includes("blacklist")) {
      return "⚠️ BLACKLISTED WORD DETECTED";
    }
    if (type.includes("bad_prompt") || type.includes("bad prompt")) {
      return "⚠️ BAD PROMPT DETECTED";
    }
    if (type.includes("malicious")) {
      return "⚠️ MALICIOUS CONTENT";
    }
    if (type.includes("blocked")) {
      return "🚫 BLOCKED";
    }
    if (type.includes("vulnerability")) {
      return "⚠️ VULNERABILITY DETECTED";
    }
    if (type.includes("exploit")) {
      return "⚠️ EXPLOIT ATTEMPT";
    }
    if (type.includes("attack")) {
      return "⚠️ ATTACK DETECTED";
    }
    if (type.includes("threat") || type.includes("security_alert")) {
      return "⚠️ SECURITY THREAT";
    }
    return eventType.toUpperCase();
  };

  /**
   * Get CSS class for event type badge
   */
  const getEventTypeClass = (eventType: string): string => {
    const type = eventType.toLowerCase();
    
    // Security threats get critical/danger styling
    if (isSecurityThreat(type)) {
      return "log-badge log-badge--critical";
    }
    
    if (type.includes("error") || type.includes("fail")) return "log-badge log-badge--error";
    if (type.includes("warn") || type.includes("detected") || type.includes("flag")) return "log-badge log-badge--warning";
    if (type.includes("success") || type.includes("complete") || type.includes("passed") || type.includes("clean")) return "log-badge log-badge--success";
    return "log-badge log-badge--info";
  };

  return (
    <MainLayout>
      <div className="dashboard-page logs-page">
        {/* === Page Header === */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">System Logs</h1>
            <p className="page-subtitle">
              View workflow execution logs and system events
            </p>
          </div>
          <div className="header-actions">
            <button 
              className={`refresh-button ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '⏸ Pause' : '▶ Auto-refresh'}
            </button>
            <button 
              className="secondary-button"
              onClick={fetchLogs}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* === Filters === */}
        <div className="logs-filters">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Time Range</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Workflow</label>
            <select 
              value={selectedWorkflow} 
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Workflows</option>
              {workflows.map(wf => (
                <option key={wf} value={wf}>{wf}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Event Type</label>
            <select 
              value={selectedEventType} 
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              {eventTypes.map(et => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>
        </div>

        {/* === Error Message === */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={fetchLogs} className="retry-button">Retry</button>
          </div>
        )}

        {/* === Loading State === */}
        {loading && logs.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading logs...</p>
          </div>
        ) : (
          <>
            {/* === Log Stats === */}
            <div className="logs-stats">
              <span className="stat-item">
                <strong>{filteredLogs.length}</strong> logs
              </span>
              {autoRefresh && (
                <span className="stat-item auto-refresh-indicator">
                  🔄 Auto-refreshing every {refreshInterval / 1000}s
                </span>
              )}
            </div>

            {/* === Logs Table === */}
            <div className="logs-container">
              {filteredLogs.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p className="empty-text">No logs found</p>
                  <p className="empty-hint">Try adjusting your filters or time range</p>
                </div>
              ) : (
                <div className="logs-list">
                  {filteredLogs.map((log, index) => (
                    <div key={`${log.timestamp}-${index}`} className="log-entry">
                      <div className="log-header">
                        <span className="log-timestamp">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className={getEventTypeClass(log.eventType)}>
                          {isSecurityThreat(log.eventType) ? (
                            <>
                              <span className="security-icon">🚨</span>
                              {getSecurityTagLabel(log.eventType)}
                            </>
                          ) : (
                            log.eventType
                          )}
                        </span>
                        {/* Check if workflow name contains security threat */}
                        {isSecurityThreat(log.workflow) ? (
                          <span className="log-badge log-badge--critical">
                            <span className="security-icon">🚨</span>
                            {getSecurityTagLabel(log.workflow)}
                          </span>
                        ) : (
                          <span className="log-workflow">
                            {log.workflow}
                          </span>
                        )}
                        {log.node && log.node !== "unknown" && (
                          <>
                            {/* Check if node contains security threat info */}
                            {isSecurityThreat(log.node) ? (
                              <span className="log-badge log-badge--critical">
                                <span className="security-icon">🚨</span>
                                {getSecurityTagLabel(log.node)}
                              </span>
                            ) : (
                              <span className="log-node">
                                → {log.node}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className={`log-message ${isSecurityThreat(log.message) || isSecurityThreat(log.node) || isSecurityThreat(log.workflow) ? 'log-message--threat' : ''}`}>
                        {log.message}
                      </div>
                      <div className="log-meta">
                        {log.userId && (
                          <span className="log-meta-item log-meta-employee">
                            <span className="employee-icon">👤</span>
                            <strong>Employee:</strong> {log.userId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default LogsPage;
