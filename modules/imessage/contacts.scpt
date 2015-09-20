on run argv
  if (count of argv) is equal to 0 then
    set msg to "Use the following commands:
"
    set msg to msg & "  phone [name] - Get phone for contact
"
    return msg
  end if
  
  set command to item 1 of argv
  using terms from application "Contacts"
    if command is equal to "general" then
      if (count of argv) is equal to 1
        return "error"
      else
        set n to item 2 of argv
        tell application "Contacts"
          set p to value of every phone of (person 1 whose name contains n)
          set e to value of every email of (person 1 whose name contains n)
          return {p, e}
        end tell
        tell application "Contacts" to quit
      end if
    end if
  end using terms from
end run