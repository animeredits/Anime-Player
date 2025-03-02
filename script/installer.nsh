!include "MUI2.nsh"

Function installRegistryKeys
    # Add "Play with Anime Player" to all files
    WriteRegStr HKCR "*\shell\AnimePlayer" "" "Play with Anime Player"
    WriteRegStr HKCR "*\shell\AnimePlayer" "Icon" "$INSTDIR\Anime Player.exe,0"
    WriteRegStr HKCR "*\shell\AnimePlayer\command" "" '"$INSTDIR\Anime Player.exe" "%1"'

    # Add "Play with Anime Player" for folders
    WriteRegStr HKCR "Directory\shell\AnimePlayer" "" "Play with Anime Player"
    WriteRegStr HKCR "Directory\shell\AnimePlayer" "Icon" "$INSTDIR\Anime Player.exe,0"
    WriteRegStr HKCR "Directory\shell\AnimePlayer\command" "" '"$INSTDIR\Anime Player.exe" "%1"'
FunctionEnd

Function un.installRegistryKeys
    # Remove "Play with Anime Player" from all files
    DeleteRegKey HKCR "*\shell\AnimePlayer"
    DeleteRegKey HKCR "*\shell\AnimePlayer\command"

    # Remove "Play with Anime Player" from folders
    DeleteRegKey HKCR "Directory\shell\AnimePlayer"
    DeleteRegKey HKCR "Directory\shell\AnimePlayer\command"
FunctionEnd

Section "Install"
    Call installRegistryKeys
SectionEnd

Section "Uninstall"
    Call un.installRegistryKeys
SectionEnd
