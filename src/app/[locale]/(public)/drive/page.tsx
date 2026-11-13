import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, CheckCircle2, HardDrive, LockKeyhole, Share2 } from 'lucide-react'

import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function DrivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'drivePage' })

  const features = [
    { icon: LockKeyhole, title: t('privateTitle'), description: t('privateDescription') },
    { icon: Share2, title: t('sharingTitle'), description: t('sharingDescription') },
    { icon: CheckCircle2, title: t('organizedTitle'), description: t('organizedDescription') },
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="container mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <HardDrive className="h-4 w-4" />
            {t('eyebrow')}
          </div>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {t('description')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                {t('createAccount')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">{t('signIn')}</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-3xl bg-blue-100 shadow-xl dark:bg-blue-950/50">
          <Image
            src="/drive.png"
            alt={t('imageAlt')}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="space-y-3 p-6">
                <Icon className="h-7 w-7 text-blue-600" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
