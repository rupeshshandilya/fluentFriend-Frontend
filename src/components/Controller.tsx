import { useState, useCallback } from "react";
import Title from "./Title";
import axios from "axios";
import RecordMessage from "./RecordMessage";

const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const createBlobURL = (data: any) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  };

  const handleStop = useCallback(async (blobUrl: string) => {
    setIsLoading(true);

    // Append recorded message to messages
    const myMessage = { sender: "me", blobUrl };

    try {
      // convert blob url to blob object
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      // Construct audio to send file
      const formData = new FormData();
      formData.append("file", blob, "myFile.wav");

      // send form data to api endpoint
      const res = await axios.post("http://localhost:8000/post-audio", formData, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
        responseType: "arraybuffer",
      });

      const audioBlob = res.data;
      const audioSrc = createBlobURL(audioBlob);

      // Append to audio
      setMessages((prevMessages) => [...prevMessages, myMessage, { sender: "rachel", blobUrl: audioSrc }]);

      // Play audio
      setIsLoading(false);
      new Audio(audioSrc).play();
    } catch (error) {
      console.error("Error in API call:", error);
      setIsLoading(false);
    }
  }, [setMessages]);

  return (
    <div className="h-screen overflow-y-hidden">
      {/* Title */}
      <Title setMessages={setMessages} />

      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* Conversation */}
        <div className="mt-5 px-5">
          {messages?.map((audio, index) => (
            <div
              key={index + audio.sender}
              className={`flex flex-col ${audio.sender === "rachel" && "flex items-end"}`}
            >
              {/* Sender */}
              <div className="mt-4 ">
                <p
                  className={`${
                    audio.sender === "rachel" ? "text-right mr-2 italic text-green-500" : "ml-2 italic text-blue-500"
                  }`}
                >
                  {audio.sender}
                </p>

                {/* Message */}
                <audio src={audio.blobUrl} className="appearance-none" controls />
              </div>
            </div>
          ))}

          {messages.length === 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">
              Send a message...
            </div>
          )}

          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">
              Gimme a few seconds...
            </div>
          )}
        </div>

        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500">
          <div className="flex justify-center items-center w-full">
            <div>
              <RecordMessage handleStop={handleStop} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controller;
