export default function ExternalLink ({ children, href, className }: { children: React.ReactNode, href: string, className: string }) {
  return (
    <a href={href} className={`transition-colors focus:text-white text-gray-300 hover:text-white font-semibold ` + className} target="_blank">
      {children}
    </a>
  )
}
