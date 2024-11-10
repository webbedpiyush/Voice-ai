import Image from "next/image";
import AssistantButton from "@/components/AssistantButton";

export default function Home() {
  return (
    <div>
      <div className="block">
        <main className="flex flex-col justify-center items-center p-24 min-h-screen">
          <div>
            <Image
              src={"/logo.png"}
              alt="main logo"
              width={650}
              height={100}
            />
          </div>
          <div className="absolute bottom-0 right-0 pb-10 pr-10">
            <AssistantButton />
          </div>
        </main>
      </div>
    </div>
  );
}
