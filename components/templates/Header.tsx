import Link from "next/link";

export function Header() {
  return <header>
    <nav>
        <ul>
            <li>
                <Link href="/">Home</Link>
            </li>
            <li>
                <Link href="/feeds">Feeds</Link>
            </li>
            <li>
                <Link href="/chat">Chat</Link>
            </li>
            <li>
                <Link href="/signup">Signup</Link>
            </li>
            <li>
                <Link href="/signin">Signin</Link>
            </li>
        </ul>
    </nav>
  </header>;
}