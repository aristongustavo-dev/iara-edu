try {
    $log = Get-Content "cloudflared.log" -ErrorAction SilentlyContinue
    $match = $log | Select-String -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -Last 1
    if ($match) {
        $url = ($match.Matches[0].Value -replace '\s+', '')
        Set-Content "watchdog-url.txt" -Value $url -Encoding UTF8 -NoNewline
        Write-Output "URL: $url"
    } else {
        Write-Output "Nenhum URL encontrado"
    }
} catch {
    Write-Output "Erro: $($_.Exception.Message)"
}
