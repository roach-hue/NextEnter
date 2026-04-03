# 로고 파일명 변경
$logoPath = "C:\TheCareer\NextEnterFront\public\images\companies\logos"
$thumbPath = "C:\TheCareer\NextEnterFront\public\images\companies\thumbnails"
$detailPath = "C:\TheCareer\NextEnterFront\public\images\companies\details"

# 회사별 매핑 (한글 -> 영문)
$mapping = @{
    "네이버" = "naver"
    "카카오" = "kakao"
    "쿠팡" = "coupang"
    "토스" = "toss"
    "무신사" = "musinsa"
    "업비트" = "upbit"
    "쏘카" = "socar"
    "에이블리" = "ably"
    "지그재그" = "zigzag"
    "몰로코" = "moloco"
    "샌드버드" = "sendbird"
    "센드버드" = "sendbird"
    "루닛" = "lunit"
    "매스프레소" = "mathpresso"
    "메스프레소" = "mathpresso"
    "리디" = "ridi"
    "두들린" = "doodlin"
    "팀 스파르타" = "teamsparta"
    "팀스파르타" = "teamsparta"
    "플렉스" = "flex"
    "플랙스" = "flex"
    "인프랩" = "inflab"
    "스푼" = "spoon"
    "왓챠" = "watcha"
}

# 로고 변경
Get-ChildItem $logoPath | ForEach-Object {
    $newName = $_.Name
    foreach ($key in $mapping.Keys) {
        if ($_.Name -match $key) {
            $ext = $_.Extension
            $newName = "$($mapping[$key])_logo$ext"
            break
        }
    }
    if ($newName -ne $_.Name) {
        Rename-Item $_.FullName -NewName $newName -Force
        Write-Host "Logo: $($_.Name) -> $newName"
    }
}

# 썸네일 변경
Get-ChildItem $thumbPath | ForEach-Object {
    $newName = $_.Name
    foreach ($key in $mapping.Keys) {
        if ($_.Name -match $key) {
            $ext = $_.Extension
            $newName = "$($mapping[$key])_thumb$ext"
            break
        }
    }
    if ($newName -ne $_.Name) {
        Rename-Item $_.FullName -NewName $newName -Force
        Write-Host "Thumb: $($_.Name) -> $newName"
    }
}

# 디테일 변경
Get-ChildItem $detailPath | ForEach-Object {
    $newName = $_.Name
    foreach ($key in $mapping.Keys) {
        if ($_.Name -match $key) {
            $ext = $_.Extension
            $newName = "$($mapping[$key])_detail$ext"
            break
        }
    }
    if ($newName -ne $_.Name) {
        Rename-Item $_.FullName -NewName $newName -Force
        Write-Host "Detail: $($_.Name) -> $newName"
    }
}

Write-Host "`nRename completed!"
