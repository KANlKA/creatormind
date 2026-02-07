'use client';
import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/hooks/use-scroll';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { ProfileDropdown } from '@/components/layout/profile-dropdown';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);
	const { data: session } = useSession();
	const pathname = usePathname();

	// Don't show header on auth pages
	if (pathname?.startsWith('/auth')) {
		return null;
	}

	const links = session?.user ? [
		{
			label: 'Dashboard',
			href: '/dashboard',
		},
		{
			label: 'Insights',
			href: '/insights',
		},
		{
			label: 'Ideas',
			href: '/ideas',
		},
	] : [];

	React.useEffect(() => {
		if (open) {
			// Disable scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Re-enable scroll
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts (important for Next.js)
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<div className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4">
		<header
			className={cn(
				'w-full transition-all ease-out duration-300 bg-black/60 supports-[backdrop-filter]:bg-black/40 backdrop-blur-md rounded-2xl border border-white/10',
				{
					'max-w-5xl': !scrolled,
					'max-w-4xl border-white/20 shadow-lg bg-black/80 supports-[backdrop-filter]:bg-black/60 backdrop-blur-lg': scrolled,
					'bg-black/90': open,
				},
			)}
		>
			<div className={cn(
				'transition-all ease-out duration-300',
				{
					'px-6': !scrolled,
					'px-4': scrolled,
				}
			)}>
			<nav
				className={cn(
					'flex w-full items-center justify-between transition-all ease-out duration-300',
					{
						'h-16': !scrolled,
						'h-14': scrolled,
					},
				)}
			>
				<Link href="/" className="text-xl font-bold text-white">
					CreatorMind
				</Link>
				<div className="hidden items-center gap-2 md:flex">
					{links.map((link, i) => (
						<Link key={i} className={buttonVariants({ variant: 'ghost', className: 'text-white hover:bg-white/10 rounded-xl' })} href={link.href}>
							{link.label}
						</Link>
					))}
					{session?.user ? (
						<>
							<Button
								variant="ghost"
								onClick={() => signOut({ callbackUrl: '/' })}
								className="text-white hover:bg-white/10 rounded-xl"
							>
								Logout
							</Button>
							<ProfileDropdown />
						</>
					) : (
						<Link href="/auth/signin">
							<HoverBorderGradient
								containerClassName="rounded-full"
								as="button"
								className="bg-black text-white flex items-center space-x-2"
							>
								<span>Sign In</span>
							</HoverBorderGradient>
						</Link>
					)}
				</div>
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden text-white border-white hover:bg-white/10 rounded-xl">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
			</div>

			<div
				className={cn(
					'bg-black/95 fixed right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-white/10 md:hidden',
					scrolled ? 'top-14' : 'top-16',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<Link
								key={link.label}
								className={buttonVariants({
									variant: 'ghost',
									className: 'justify-start text-white hover:bg-white/10 rounded-xl',
								})}
								href={link.href}
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-2">
						{session?.user ? (
							<>
								<div className="flex justify-center mb-2">
									<ProfileDropdown />
								</div>
								<Button
									variant="ghost"
									onClick={() => signOut({ callbackUrl: '/' })}
									className="w-full text-white hover:bg-white/10 rounded-xl"
								>
									Logout
								</Button>
							</>
						) : (
							<Link href="/auth/signin" className="w-full flex justify-center">
								<HoverBorderGradient
									containerClassName="rounded-full w-full"
									as="button"
									className="bg-black text-white flex items-center justify-center space-x-2 w-full"
								>
									<span>Sign In</span>
								</HoverBorderGradient>
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
		</div>
	);
}
