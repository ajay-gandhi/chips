on run argv
  if (count of argv) is equal to 0 then
    set msg to "Use the following commands:
"
    set msg to msg & "  phone [name] - Get phone for contact
"
    return msg
  end if
  
  set command to item 1 of argv
  using terms from application "Messages"
    if command is equal to "phone" then
      if (count of argv) is equal to 1
        return "error"
      else
        set n to item 2 of argv
        tell application "Contacts"
          set p to value of phone 1 of (person 1 whose name = n)
        end tell
      end if
    end if
  end using terms from
end run