
on run argv
  if (count of argv) is equal to 0 then
    set msg to "Use the following commands:
"
    set msg to msg & " send [recipient] [message] - Send an iMessage
"
    return msg
  end if
  
  set command to item 1 of argv
  using terms from application "Messages"
    if command is equal to "send" then
      if (count of argv) is equal to 1 or (count of argv) is equal to 2 then
        return info
      else
        set recipient to item 2 of argv
        set message to item 3 of argv
        tell application "Messages"
          send message to buddy recipient of (service 1 whose service type is iMessage)
          tell application "Messages" to close window 1
        end tell
      end if
    end if
  end using terms from
end run
