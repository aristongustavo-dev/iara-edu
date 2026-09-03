Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Lenovo\Documents\Projeto Rico\iara-edu"
WshShell.Run "cmd /c run-tunnel.bat", 0, False
