import speech_recognition as sr
import sys
import json
from fuzzywuzzy import process

# Define recognizer and command mappings
recognizer = sr.Recognizer()
command_map = {
    "play": "play",
    "pause": "stop",
    "next": "next",
    "back": "previous",
    "resume": "play",
    "stop": "pause",
    "forward": "next",
    "rewind": "previous",
    "exit": "exit"
}


def takeCommand(language="en-in"):
    """
    Takes microphone input from the user and returns recognized string output.
    Allows specifying language, with 'en-us' as the default.
    """
    with sr.Microphone() as source:
        # Adjust for ambient noise and set pause threshold for faster command detection
        recognizer.adjust_for_ambient_noise(source, duration=0.2)
        recognizer.pause_threshold = 0.5  # Adjust this as necessary
        # Send to stderr to avoid JSON parsing errors
        sys.stderr.write("Listening...\n")

        try:
            audio = recognizer.listen(source, timeout=1, phrase_time_limit=2)
        except sr.WaitTimeoutError:
            sys.stderr.write("No audio detected (timeout).\n")
            return None

    try:
        sys.stderr.write("Recognizing...\n")
        query = recognizer.recognize_google(audio, language=language)
        sys.stderr.write(f"User said: {query}\n")
        return query

    except sr.UnknownValueError:
        sys.stderr.write("Could not understand the audio.\n")
        return None  # Return None if the command is not understood

    except sr.RequestError as e:
        sys.stderr.write(f"Recognition service error: {e}\n")
        return None


def recognize_command(query):
    """Match recognized text to the closest command and return corresponding action."""
    if query:
        # Use fuzzy matching to find the best command match
        command, confidence = process.extractOne(
            query.lower(), command_map.keys())

        # Check if the confidence level is acceptable (e.g., > 70%)
        if confidence > 10:
            sys.stderr.write(
                f"Matched command: {command} with confidence: {confidence}\n")
            return command_map[command]
        else:
            sys.stderr.write(
                f"No high-confidence match found for query: {query}\n")
    else:
        sys.stderr.write("No query provided for command recognition.\n")
    return None


def listen_for_commands():
    """Continuously listens for voice commands with intent matching."""
    sys.stderr.write("Listening for voice commands...\n")

    consecutive_failures = 0  # Counter for consecutive failures
    max_failures = 3  # Maximum consecutive failures before notifying user

    while True:
        query = takeCommand()
        if query:
            command = recognize_command(query)

            # If a command is recognized, output the command as JSON
            if command:
                if command == "exit":
                    sys.stderr.write("Exiting program...\n")
                    sys.exit(0)  # Exit the program gracefully
                sys.stdout.write(json.dumps({"command": command}) + "\n")
                sys.stdout.flush()
                consecutive_failures = 0  # Reset failure count on success
            else:
                consecutive_failures += 1  # Increment failure count
                if consecutive_failures >= max_failures:
                    sys.stderr.write(
                        "Could not understand the command. Please repeat.\n")
                    consecutive_failures = 0  # Reset failure count after notifying

        else:
            # Handle the case when no audio is detected
            if consecutive_failures == 0:
                sys.stderr.write("No audio detected. Waiting for command...\n")


if __name__ == "__main__":
    listen_for_commands()
