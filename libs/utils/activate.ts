import { spawn } from 'child_process'

export const windows = (pid: string) => {
   console.log('ACTIVATING WINDOWS..', pid)

   const child = spawn('powershell.exe', ['-Command', '-'])

   child.stdout.on('data', function (data) {
      console.log(data.toString())
   })

   child.stderr.on('data', function (data) {
      console.log(data.toString())
   })

   child.stdin.write(
      `function Show-Process($Process, [Switch]$Maximize)
{
  $sig = '
    [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern int SetForegroundWindow(IntPtr hwnd);
  '

  if ($Maximize) { $Mode = 3 } else { $Mode = 4 }
  $type = Add-Type -MemberDefinition $sig -Name WindowAPI -PassThru
  $hwnd = $process.MainWindowHandle
  $null = $type::ShowWindowAsync($hwnd, $Mode)
  $null = $type::SetForegroundWindow($hwnd)
}
Start-Sleep -Seconds 5
Show-Process -Process (Get-Process -Id ${pid}) -Maximize`,
   )

   child.stdin.end()
}

// prettier-ignore
export const darwin = (pid: string) =>
   spawn('osascript', [
      '-e', 
      `tell application "System Events"
          set frontmost of the first process whose unix id is ${pid} to true
       end tell`
   ])

// prettier-ignore
export const activate = (pid: string) => {
   switch (process.platform) {
      case "darwin": {
         return darwin(pid)
      }
      case "win32": {
         return windows(pid)
      }
      default: {
         console.error("Activate: Platform not supported")
      }
   }
}
