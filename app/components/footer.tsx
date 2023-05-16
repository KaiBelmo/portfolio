import "@/assets/css/font.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full text-sm font-inter">
      <div className="container w-full mx-auto">
        <div className="flex items-center justify-between w-full pb-8 font-medium max-md:flex-col">
          <div className=""> 
            <span className="">
              Created by{" "}
              <Link
                href="https://github.com/kaibelmo"
                target="_blank"
                className="font-normal underline cursor-help"
              >
                {" "}
                Belmo
              </Link>
              .
            </span>
            <span className="max-md:hidden">
              <br /> Built with{" "}
              <Link
                href="https://nextjs.org/"
                target="_blank"
                className="font-normal underline cursor-help"
              >
                Next.js
              </Link>{" "}
              and{" "}
              <Link
                href="https://www.typescriptlang.org/"
                target="_blank"
                className="font-normal underline cursor-help"
              >
                Typescript
              </Link>
              .
            </span>
          </div>
          <div className="flex gap-3.5 max-md:gap-1.5 self-end max-md:self-auto [&>*]:underline font-normal">
            <Link href="https://github.com/kaibelmo" target="_blank">
              GitHub
            </Link>
            <Link href="https://twitter.com/belmo01" target="_blank">
              Twitter
            </Link>
            <Link
              href="https://www.linkedin.com/in/belmo-mohamed-ali/"
              target="_blank"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
