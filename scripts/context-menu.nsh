!include "MUI2.nsh"

# Set the installation directory
!define APP_NAME "Anime Player"
!define APP_EXECUTABLE "Anime Player.exe"

Section "Install"
  # Create registry entries for context menu
  WriteRegStr HKCR "*\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "*\shell\AnimePlayer" "Icon" "$INSTDIR\${APP_EXECUTABLE}"
  WriteRegStr HKCR "*\shell\AnimePlayer\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'

  # Register for specific file types
  WriteRegStr HKCR "SystemFileAssociations\.mp4\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "SystemFileAssociations\.mp4\shell\AnimePlayer\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'

  WriteRegStr HKCR "SystemFileAssociations\.mkv\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "SystemFileAssociations\.mkv\shell\AnimePlayer\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'

  WriteRegStr HKCR "SystemFileAssociations\.avi\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "SystemFileAssociations\.avi\shell\AnimePlayer\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  
  WriteRegStr HKCR "SystemFileAssociations\.flv\shell\AnimePlayer" "" "Open with Anime Player"
  WriteRegStr HKCR "SystemFileAssociations\.flv\shell\AnimePlayer\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'

  # Register for folders (so you can right-click a folder and open all videos inside)
  WriteRegStr HKCR "Directory\shell\AnimePlayer" "" "Open Folder with Anime Player"
  WriteRegStr HKCR "Directory\shell\AnimePlayer" "Icon" "$INSTDIR\${APP_EXECUTABLE}"
  WriteRegStr HKCR "Directory\shell\AnimePlayer\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'

SectionEnd

Section "Uninstall"
  # Remove context menu registry entries
  DeleteRegKey HKCR "*\shell\AnimePlayer"
  DeleteRegKey HKCR "SystemFileAssociations\.mp4\shell\AnimePlayer"
  DeleteRegKey HKCR "SystemFileAssociations\.mkv\shell\AnimePlayer"
  DeleteRegKey HKCR "SystemFileAssociations\.avi\shell\AnimePlayer"
  DeleteRegKey HKCR "SystemFileAssociations\.flv\shell\AnimePlayer"
  DeleteRegKey HKCR "Directory\shell\AnimePlayer"

  # Ensure the uninstaller is written
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd
