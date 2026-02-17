!macro customInstall
  DetailPrint "Register Anime Player context menu..."
  
  ; Remove any existing entries first
  DeleteRegKey HKCR "*\shell\Open with Anime Player"
  DeleteRegKey HKCR "Directory\shell\Open with Anime Player"
  DeleteRegKey HKCR "Directory\Background\shell\Open with Anime Player"
  
  ; For FILES - Add to main context menu (like Notepad++, VS Code)
  WriteRegStr HKCR "*\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "*\shell\AnimePlayer" "Icon" "$INSTDIR\${PRODUCT_FILENAME}.exe,0"
  WriteRegStr HKCR "*\shell\AnimePlayer" "Position" "Top"  ; Try to put it at the top
  WriteRegStr HKCR "*\shell\AnimePlayer\command" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe" "%1"'
  
  ; For FOLDERS - Add to main context menu
  WriteRegStr HKCR "Directory\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "Directory\shell\AnimePlayer" "Icon" "$INSTDIR\${PRODUCT_FILENAME}.exe,0"
  WriteRegStr HKCR "Directory\shell\AnimePlayer" "Position" "Top"
  WriteRegStr HKCR "Directory\shell\AnimePlayer\command" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe" "%1"'
  
  ; For FOLDER BACKGROUND (empty space) - Add to main context menu
  WriteRegStr HKCR "Directory\Background\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "Directory\Background\shell\AnimePlayer" "Icon" "$INSTDIR\${PRODUCT_FILENAME}.exe,0"
  WriteRegStr HKCR "Directory\Background\shell\AnimePlayer" "Position" "Top"
  WriteRegStr HKCR "Directory\Background\shell\AnimePlayer\command" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe" "%V"'
  
  ; Register for specific video file types (will appear in "Open with" submenu)
  WriteRegStr HKCR ".mp4\OpenWithProgids" "AnimePlayer" ""
  WriteRegStr HKCR ".mkv\OpenWithProgids" "AnimePlayer" ""
  WriteRegStr HKCR ".avi\OpenWithProgids" "AnimePlayer" ""
  WriteRegStr HKCR ".mov\OpenWithProgids" "AnimePlayer" ""
  WriteRegStr HKCR ".webm\OpenWithProgids" "AnimePlayer" ""
  WriteRegStr HKCR ".flv\OpenWithProgids" "AnimePlayer" ""
  
  ; Create ProgID for better integration
  WriteRegStr HKCR "AnimePlayer" "" "Anime Player Document"
  WriteRegStr HKCR "AnimePlayer\DefaultIcon" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe",0'
  WriteRegStr HKCR "AnimePlayer\shell\open\command" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe" "%1"'
  
  ; Add to "Send to" menu (optional)
  CreateDirectory "$SENDTO"
  CreateShortCut "$SENDTO\Anime Player.lnk" "$INSTDIR\${PRODUCT_FILENAME}.exe"
  
  ; Refresh shell to show changes immediately
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DetailPrint "Removing Anime Player context menu..."
  
  ; Remove main context menu entries
  DeleteRegKey HKCR "*\shell\AnimePlayer"
  DeleteRegKey HKCR "Directory\shell\AnimePlayer"
  DeleteRegKey HKCR "Directory\Background\shell\AnimePlayer"
  
  ; Remove file associations
  DeleteRegValue HKCR ".mp4\OpenWithProgids" "AnimePlayer"
  DeleteRegValue HKCR ".mkv\OpenWithProgids" "AnimePlayer"
  DeleteRegValue HKCR ".avi\OpenWithProgids" "AnimePlayer"
  DeleteRegValue HKCR ".mov\OpenWithProgids" "AnimePlayer"
  DeleteRegValue HKCR ".webm\OpenWithProgids" "AnimePlayer"
  DeleteRegValue HKCR ".flv\OpenWithProgids" "AnimePlayer"
  
  ; Remove ProgID
  DeleteRegKey HKCR "AnimePlayer"
  
  ; Remove from Send to menu
  Delete "$SENDTO\Anime Player.lnk"
  
  ; Refresh shell
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend