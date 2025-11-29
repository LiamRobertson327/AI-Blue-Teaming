logging {
  level = "info"
}

loki.write "default" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}

local.file_match "n8n_logs" {
  path_targets = [
    { __path__ = "/var/log/n8n/*.log", job = "n8n-logs" },
  ]
}

loki.source.file "n8n" {
  targets        = local.file_match.n8n_logs.targets
  forward_to     = [loki.write.default.receiver]
}