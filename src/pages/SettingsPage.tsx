import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { FileUpload } from '@/components/ui/file-upload'
import { useAppStore } from '@/stores'
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
} from 'lucide-react'

export function SettingsPage() {
  const { 
    user, 
    isDarkMode, 
    toggleDarkMode, 
    setFinancialData,
    addTransaction,
    addCashAccount 
  } = useAppStore()
  const [showUpload, setShowUpload] = useState(false)

  const handleFileUpload = (data: any) => {
    console.log('📥 업로드된 원본 데이터:', data)
    
    // 지능형 데이터 매핑 및 실제 스토어에 저장
    if (data.transactions && data.transactions.length > 0) {
      // 거래 내역을 거래 스토어에 추가
      data.transactions.forEach((transaction: any) => {
        addTransaction?.(transaction)
      })
      console.log(`✅ ${data.transactions.length}개 거래 내역이 추가되었습니다`)
    }
    
    if (data.cashAccounts && data.cashAccounts.length > 0) {
      // 계좌 정보를 계좌 스토어에 추가
      data.cashAccounts.forEach((account: any) => {
        addCashAccount?.(account)
      })
      console.log(`🏦 ${data.cashAccounts.length}개 계좌가 추가되었습니다`)
    }
    
    // 기존 금융 데이터도 저장 (차트용)
    setFinancialData?.(data)
    
    // 성공 메시지 표시
    alert(`데이터 업로드 완료!\n- 거래내역: ${data.transactions?.length || 0}개\n- 계좌: ${data.cashAccounts?.length || 0}개`)
    
    // 업로드 성공 후 섹션 숨김
    setTimeout(() => {
      setShowUpload(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">설정</h1>
          <p className="text-muted-foreground">계정 설정과 앱 환경설정을 관리하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              사용자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="userName" className="text-sm font-medium">이름</label>
              <Input id="userName" name="userName" defaultValue={user?.name || '사용자'} />
            </div>
            <div>
              <label htmlFor="userEmail" className="text-sm font-medium">이메일</label>
              <Input id="userEmail" name="userEmail" defaultValue={user?.email || 'user@example.com'} />
            </div>
            <div>
              <label htmlFor="userPhone" className="text-sm font-medium">전화번호</label>
              <Input id="userPhone" name="userPhone" placeholder="010-1234-5678" />
            </div>
            <Button>정보 업데이트</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              앱 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">다크 모드</p>
                <p className="text-sm text-muted-foreground">어두운 테마 사용</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
            <div>
              <label htmlFor="currency" className="text-sm font-medium">기본 통화</label>
              <select id="currency" name="currency" className="w-full mt-1 px-3 py-2 border rounded-md">
                <option value="KRW">원화 (KRW)</option>
                <option value="USD">달러 (USD)</option>
                <option value="EUR">유로 (EUR)</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="text-sm font-medium">언어</label>
              <select id="language" name="language" className="w-full mt-1 px-3 py-2 border rounded-md">
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">가격 알림</p>
                <p className="text-sm text-muted-foreground">주식 가격 변동 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">배당 알림</p>
                <p className="text-sm text-muted-foreground">배당금 지급일 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">목표 달성</p>
                <p className="text-sm text-muted-foreground">투자 목표 달성 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">월별 리포트</p>
                <p className="text-sm text-muted-foreground">월말 자산 요약 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              보안
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              비밀번호 변경
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">2단계 인증</p>
                <p className="text-sm text-muted-foreground">추가 보안 인증</p>
              </div>
              <Badge variant="success">활성화</Badge>
            </div>
            <Button variant="outline" className="w-full">
              로그인 기록 확인
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              데이터 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              데이터 내보내기 (Excel)
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Upload className="h-4 w-4 mr-2" />
              금융 데이터 가져오기
            </Button>
            <Button variant="outline" className="w-full">
              백업 생성
            </Button>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              모든 데이터 삭제
            </Button>
          </CardContent>
        </Card>

        {showUpload && (
          <div className="lg:col-span-2">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>API 연동</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">증권사 API</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">한국투자증권</span>
                  <Badge variant="success">연결됨</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">키움증권</span>
                  <Badge variant="outline">미연결</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              새 API 연결
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>앱 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">1.0.0</p>
              <p className="text-sm text-muted-foreground">버전</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">99.9%</p>
              <p className="text-sm text-muted-foreground">가동률</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">30일</p>
              <p className="text-sm text-muted-foreground">사용 기간</p>
            </div>
            <div>
              <p className="text-2xl font-bold">256bit</p>
              <p className="text-sm text-muted-foreground">보안 수준</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}