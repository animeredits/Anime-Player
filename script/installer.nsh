!include "MUI2.nsh"

Function AddContextMenuEntries
  ; For files (right-click on a file)
  WriteRegStr HKCR "*\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "*\shell\AnimePlayer" "Icon" "$INSTDIR\Anime Player.exe,0"
  WriteRegStr HKCR "*\shell\AnimePlayer\command" "" '"$INSTDIR\Anime Player.exe" "%1"'

  ; For folders (right-click on a folder)
  WriteRegStr HKCR "Directory\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "Directory\shell\AnimePlayer" "Icon" "$INSTDIR\Anime Player.exe,0"
  WriteRegStr HKCR "Directory\shell\AnimePlayer\command" "" '"$INSTDIR\Anime Player.exe" "%1"'

  ; For folder background (right-click in empty space)
  WriteRegStr HKCR "Directory\Background\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "Directory\Background\shell\AnimePlayer" "Icon" "$INSTDIR\Anime Player.exe,0"
  WriteRegStr HKCR "Directory\Background\shell\AnimePlayer\command" "" '"$INSTDIR\Anime Player.exe" "%V"'
FunctionEnd

Function un.RemoveContextMenuEntries
  DeleteRegKey HKCR "*\shell\AnimePlayer"
  DeleteRegKey HKCR "Directory\shell\AnimePlayer"
  DeleteRegKey HKCR "Directory\Background\shell\AnimePlayer"
FunctionEnd

Section "Install Context Menu"
  Call AddContextMenuEntries
SectionEnd

Section "un.Uninstall Context Menu"
  Call un.RemoveContextMenuEntries
SectionEnd