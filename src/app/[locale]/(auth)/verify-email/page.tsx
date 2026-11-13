import { getTranslations } from 'next-intl/server'
import { Activity, CheckCircle2, XCircle } from 'lucide-react'

import { Link } from '@/i18n/routing'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { verifyEmailAddress } from '@/server/services/auth.service'

export const dynamic = 'force-dynamic'

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { locale } = await params
  const { token } = await searchParams
  const t = await getTranslations({ locale, namespace: 'emailVerification' })
  const verified = token ? await verifyEmailAddress(token) : false

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-lg dark:border-slate-800">
        <CardContent className="flex flex-col items-center gap-4 pt-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
            <Activity className="h-7 w-7" />
          </div>
          {verified ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          ) : (
            <XCircle className="h-10 w-10 text-red-600" aria-hidden="true" />
          )}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {verified ? t('successTitle') : t('invalidTitle')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {verified ? t('successMessage') : t('invalidMessage')}
          </p>
          <Button asChild className="mt-2 w-full">
            <Link href="/login">{t('login')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
