/**
 * Blocking inline script that applies the theme before first paint.
 * Must be placed in <head> before any rendered content to avoid a flash.
 *
 * Reads `localStorage.theme` first; falls back to `prefers-color-scheme`.
 */
export default function ThemeScript() {
  const code = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s==='dark'||s==='light'?s:(m?'dark':'light');var r=document.documentElement;if(t==='dark')r.classList.add('dark');else r.classList.remove('dark');r.style.colorScheme=t;}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
