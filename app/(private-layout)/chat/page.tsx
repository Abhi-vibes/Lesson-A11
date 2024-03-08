import ChatInput from "./input";

export default function Chat() {
  return (
    <div className="grow">
      <div className="flex flex-col items-start gap-4 pb-10 min-h-[75vh] sm:w-[95%]">
        <div className="grid grid-cols-2">
          <div className="text-xl font-medium dark:text-sky-200 text-sky-700">
            To Start creating your lecture material
            <br /><br />Please provide details in this format: keyword, level, duration. Levels range from 3 (introductory) to 7 (professional). 
            <br /><br />Example:
            <br />Keyword/Topic: <strong>Digital Marketing Trends</strong><br />
            Level: <strong>6</strong><br />
            Duration: <strong>1 hour</strong><br />
            <br />Some more Examples for Input:<br />
            Digital Marketing Trends, Level 6, 1 hour<br />
            Advanced Robotics, Level 7, 3 hours<br />
            <br></br>Please follow the examples to input your request below.
          </div>
          <div className="dark:text-slate-300 text-slate-900"></div>
        </div>
      </div>
      <div className="mt-5 bottom-0 sticky pb-8 pt-1 bg-background mr-10">
        <div className="grid grid-cols-2">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
