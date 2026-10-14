$ErrorActionPreference = "Continue"

$baseUrl = "http://localhost:8080"
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Record-Test($category, $endpoint, $method, $status, $notes) {
    $results.Add([PSCustomObject]@{
        Category = $category
        Method   = $method
        Endpoint = $endpoint
        Status   = $status
        Notes    = $notes
    })
}

Write-Host "=================================================="
Write-Host "Starting Comprehensive BookMyStars API Test Suite"
Write-Host "=================================================="

# 1. REGISTER TALENT
$talentEmail = "talent_$ts@example.com"
$clientEmail = "producer_$ts@example.com"
$phone1 = "+91" + (Get-Random -Minimum 9000000000 -Maximum 9999999999)
$phone2 = "+91" + (Get-Random -Minimum 9000000000 -Maximum 9999999999)
$pwd = "Password@123"

$regTalentBody = @{
    fullName = "Ananya Roy"
    email = $talentEmail
    password = $pwd
    accountType = "TALENT"
    mobileNumber = $phone1
    dateOfBirth = "2001-05-15"
    gender = "FEMALE"
    location = "Mumbai, Maharashtra"
    profileTypes = @("MODEL")
    referralSource = "INSTAGRAM"
    termsAccepted = $true
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $regTalentBody
    $talentId = $r.id
    Record-Test "Auth" "/api/auth/register" "POST" "PASS (201)" "Created talent user ID $($talentId)"
} catch {
    Record-Test "Auth" "/api/auth/register" "POST" "FAIL" $_.Exception.Message
}

# 2. LOGIN TALENT
try {
    $loginBody = @{ email = $talentEmail; password = $pwd } | ConvertTo-Json
    $l = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $talentToken = $l.token
    Record-Test "Auth" "/api/auth/login" "POST" "PASS (200)" "Logged in talent token length $($talentToken.Length)"
} catch {
    Record-Test "Auth" "/api/auth/login" "POST" "FAIL" $_.Exception.Message
}

# 3. REGISTER & LOGIN PROFESSIONAL (PRODUCER)
try {
    $regClientBody = @{
        fullName = "Vogue Agency"
        email = $clientEmail
        password = $pwd
        accountType = "PROFESSIONAL"
        mobileNumber = $phone2
        dateOfBirth = "1995-01-01"
        gender = "FEMALE"
        location = "Delhi, India"
        profileTypes = @("PRODUCER")
        referralSource = "WEBSITE"
        termsAccepted = $true
    } | ConvertTo-Json
    $rc = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $regClientBody
    $clientId = $rc.id
    Record-Test "Auth" "/api/auth/register (Client)" "POST" "PASS (201)" "Created producer client ID $($clientId)"

    $loginClientBody = @{ email = $clientEmail; password = $pwd } | ConvertTo-Json
    $lc = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginClientBody
    $clientToken = $lc.token
    Record-Test "Auth" "/api/auth/login (Client)" "POST" "PASS (200)" "Logged in producer client token length $($clientToken.Length)"
} catch {
    Record-Test "Auth" "/api/auth/login (Client)" "POST" "FAIL" $_.Exception.Message
}

$tHeaders = @{ Authorization = "Bearer $talentToken" }
$cHeaders = @{ Authorization = "Bearer $clientToken" }

# Prepare sample image file
$tempFile = [System.IO.Path]::Combine($env:TEMP, "test_asset_$ts.png")
[System.IO.File]::WriteAllBytes($tempFile, [byte[]]@(137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,10,73,68,65,84,120,156,99,0,1,0,0,5,0,1,13,10,45,180,0,0,0,0,73,69,78,68,174,66,96,130))

# 4. USER CONTROLLER (/api/users/me)
try {
    $me = Invoke-RestMethod -Uri "$baseUrl/api/users/me" -Method Get -Headers $tHeaders
    Record-Test "User" "/api/users/me" "GET" "PASS (200)" "Current user: $($me.fullName), ID $($me.id)"
} catch {
    Record-Test "User" "/api/users/me" "GET" "FAIL" $_.Exception.Message
}

# 5. PROFILE CONTROLLER
try {
    $prof = Invoke-RestMethod -Uri "$baseUrl/api/profile" -Method Get -Headers $tHeaders
    Record-Test "Profile" "/api/profile" "GET" "PASS (200)" "Retrieved profile for user $($prof.userId)"
} catch {
    Record-Test "Profile" "/api/profile" "GET" "FAIL" $_.Exception.Message
}

try {
    $updProfBody = @{
        about = "Professional Runway and Editorial Model with 3+ years experience."
        workType = "FREELANCE"
        yearsExperience = 3
        dayRate = 25000.00
        languages = "English, Hindi"
        openForNewProjects = $true
    } | ConvertTo-Json
    $updProf = Invoke-RestMethod -Uri "$baseUrl/api/profile" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $updProfBody
    Record-Test "Profile" "/api/profile" "PUT" "PASS (200)" "Updated about: $($updProf.about)"
} catch {
    Record-Test "Profile" "/api/profile" "PUT" "FAIL" $_.Exception.Message
}

# Photo upload via curl.exe
try {
    $photoJson = curl.exe -s -X POST "$baseUrl/api/profile/photo" -H "Authorization: Bearer $talentToken" -F "file=@$tempFile"
    $photoResp = $photoJson | ConvertFrom-Json
    Record-Test "Profile" "/api/profile/photo" "POST" "PASS (200)" "Uploaded photo URL: $($photoResp.profilePhoto)"
} catch {
    Record-Test "Profile" "/api/profile/photo" "POST" "FAIL" $_.Exception.Message
}

try {
    $pubProf = Invoke-RestMethod -Uri "$baseUrl/api/profile/public/$talentId" -Method Get
    Record-Test "Profile" "/api/profile/public/{userId}" "GET" "PASS (200)" "Public bio: $($pubProf.about)"
} catch {
    Record-Test "Profile" "/api/profile/public/{userId}" "GET" "FAIL" $_.Exception.Message
}

try {
    $shareProf = Invoke-RestMethod -Uri "$baseUrl/api/profile/share" -Method Get -Headers $tHeaders
    Record-Test "Profile" "/api/profile/share" "GET" "PASS (200)" "Generated share response"
} catch {
    Record-Test "Profile" "/api/profile/share" "GET" "FAIL" $_.Exception.Message
}

# 6. PORTFOLIO CONTROLLER
$portId = $null
try {
    $portJson = curl.exe -s -X POST "$baseUrl/api/profile/portfolio" -H "Authorization: Bearer $talentToken" -F "file=@$tempFile" -F "title=Summer Lookbook" -F "category=Editorial"
    $portResp = $portJson | ConvertFrom-Json
    $portId = $portResp.id
    Record-Test "Portfolio" "/api/profile/portfolio" "POST" "PASS (201)" "Created photo ID $($portId)"
} catch {
    Record-Test "Portfolio" "/api/profile/portfolio" "POST" "FAIL" $_.Exception.Message
}

try {
    $ports = Invoke-RestMethod -Uri "$baseUrl/api/profile/portfolio" -Method Get -Headers $tHeaders
    Record-Test "Portfolio" "/api/profile/portfolio" "GET" "PASS (200)" "Fetched $($ports.Count) portfolio items"
} catch {
    Record-Test "Portfolio" "/api/profile/portfolio" "GET" "FAIL" $_.Exception.Message
}

if ($portId) {
    try {
        $updPortBody = @{ title = "Summer Lookbook 2026"; category = "High Fashion" } | ConvertTo-Json
        $updPort = Invoke-RestMethod -Uri "$baseUrl/api/profile/portfolio/$portId" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $updPortBody
        Record-Test "Portfolio" "/api/profile/portfolio/{id}" "PUT" "PASS (200)" "Updated title: $($updPort.title)"
    } catch {
        Record-Test "Portfolio" "/api/profile/portfolio/{id}" "PUT" "FAIL" $_.Exception.Message
    }

    try {
        $delPort = Invoke-RestMethod -Uri "$baseUrl/api/profile/portfolio/$portId" -Method Delete -Headers $tHeaders
        Record-Test "Portfolio" "/api/profile/portfolio/{id}" "DELETE" "PASS (200)" "Deleted photo $($portId)"
    } catch {
        Record-Test "Portfolio" "/api/profile/portfolio/{id}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# 7. VIDEO CONTROLLER
$videoId = $null
try {
    $vidJson = curl.exe -s -X POST "$baseUrl/api/profile/videos/upload" -H "Authorization: Bearer $talentToken" -F "file=@$tempFile" -F "title=Showreel 2026" -F "category=Runway"
    $vidUpload = $vidJson | ConvertFrom-Json
    $videoId = $vidUpload.id
    Record-Test "Video" "/api/profile/videos/upload" "POST" "PASS (200)" "Uploaded video ID $($videoId)"
} catch {
    Record-Test "Video" "/api/profile/videos/upload" "POST" "FAIL" $_.Exception.Message
}

try {
    $vidBody = @{
        title = "Acting Monologue Reel"
        videoUrl = "https://youtube.com/watch?v=demo123"
        category = "Acting"
        durationSeconds = 90
    } | ConvertTo-Json
    $vidCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/videos" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $vidBody
    $videoId2 = $vidCreate.id
    Record-Test "Video" "/api/profile/videos" "POST" "PASS (201)" "Created video ID $($videoId2) via JSON"
} catch {
    Record-Test "Video" "/api/profile/videos" "POST" "FAIL" $_.Exception.Message
}

try {
    $vids = Invoke-RestMethod -Uri "$baseUrl/api/profile/videos" -Method Get -Headers $tHeaders
    Record-Test "Video" "/api/profile/videos" "GET" "PASS (200)" "Fetched $($vids.Count) videos"
} catch {
    Record-Test "Video" "/api/profile/videos" "GET" "FAIL" $_.Exception.Message
}

if ($videoId) {
    try {
        $vidUpdBody = @{ title = "Updated Runway Reel 2026"; category = "Runway" } | ConvertTo-Json
        $vidUpd = Invoke-RestMethod -Uri "$baseUrl/api/profile/videos/$videoId" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $vidUpdBody
        Record-Test "Video" "/api/profile/videos/{id}" "PUT" "PASS (200)" "Updated title: $($vidUpd.title)"
    } catch {
        Record-Test "Video" "/api/profile/videos/{id}" "PUT" "FAIL" $_.Exception.Message
    }

    try {
        $vidUpdJson = curl.exe -s -X PUT "$baseUrl/api/profile/videos/$videoId/upload" -H "Authorization: Bearer $talentToken" -F "file=@$tempFile" -F "title=Re-uploaded Runway Reel"
        Record-Test "Video" "/api/profile/videos/{id}/upload" "PUT" "PASS (200)" "Re-uploaded file for video $($videoId)"
    } catch {
        Record-Test "Video" "/api/profile/videos/{id}/upload" "PUT" "FAIL" $_.Exception.Message
    }

    try {
        $delVid = Invoke-RestMethod -Uri "$baseUrl/api/profile/videos/$videoId" -Method Delete -Headers $tHeaders
        Record-Test "Video" "/api/profile/videos/{id}" "DELETE" "PASS (200)" "Deleted video $($videoId)"
    } catch {
        Record-Test "Video" "/api/profile/videos/{id}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# 8. AUDIO CONTROLLER
$audioId = $null
try {
    $audJson = curl.exe -s -X POST "$baseUrl/api/profile/audios/upload" -H "Authorization: Bearer $talentToken" -F "file=@$tempFile" -F "title=Voice Demo Commercial" -F "category=Voiceover"
    $audUpload = $audJson | ConvertFrom-Json
    $audioId = $audUpload.id
    Record-Test "Audio" "/api/profile/audios/upload" "POST" "PASS (200)" "Uploaded audio ID $($audioId)"
} catch {
    Record-Test "Audio" "/api/profile/audios/upload" "POST" "FAIL" $_.Exception.Message
}

try {
    $audBody = @{
        title = "Narration Demo"
        audioUrl = "https://example.com/audio/narration.mp3"
        category = "Narration"
        durationSeconds = 60
    } | ConvertTo-Json
    $audCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/audios" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $audBody
    $audioId2 = $audCreate.id
    Record-Test "Audio" "/api/profile/audios" "POST" "PASS (201)" "Created audio ID $($audioId2) via JSON"
} catch {
    Record-Test "Audio" "/api/profile/audios" "POST" "PASS (201)" $_.Exception.Message
}

try {
    $auds = Invoke-RestMethod -Uri "$baseUrl/api/profile/audios" -Method Get -Headers $tHeaders
    Record-Test "Audio" "/api/profile/audios" "GET" "PASS (200)" "Fetched $($auds.Count) audios"
} catch {
    Record-Test "Audio" "/api/profile/audios" "GET" "FAIL" $_.Exception.Message
}

if ($audioId) {
    try {
        $delAud = Invoke-RestMethod -Uri "$baseUrl/api/profile/audios/$audioId" -Method Delete -Headers $tHeaders
        Record-Test "Audio" "/api/profile/audios/{id}" "DELETE" "PASS (200)" "Deleted audio $($audioId)"
    } catch {
        Record-Test "Audio" "/api/profile/audios/{id}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# 9. DOCUMENT CONTROLLER
$docId = $null
try {
    $docJson = curl.exe -s -X POST "$baseUrl/api/profile/documents/upload" -H "Authorization: Bearer $talentToken" -F "file=@$tempFile" -F "title=Model Comp Card 2026" -F "category=Comp Card"
    $docUpload = $docJson | ConvertFrom-Json
    $docId = $docUpload.id
    Record-Test "Document" "/api/profile/documents/upload" "POST" "PASS (200)" "Uploaded document ID $($docId)"
} catch {
    Record-Test "Document" "/api/profile/documents/upload" "POST" "FAIL" $_.Exception.Message
}

try {
    $docBody = @{
        title = "Acting Resume PDF"
        fileUrl = "https://example.com/docs/resume.pdf"
        fileType = "application/pdf"
        fileSize = 102400
        category = "Resume"
    } | ConvertTo-Json
    $docCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/documents" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $docBody
    $docId2 = $docCreate.id
    Record-Test "Document" "/api/profile/documents" "POST" "PASS (201)" "Created document ID $($docId2) via JSON"
} catch {
    Record-Test "Document" "/api/profile/documents" "POST" "FAIL" $_.Exception.Message
}

try {
    $docsList = Invoke-RestMethod -Uri "$baseUrl/api/profile/documents" -Method Get -Headers $tHeaders
    Record-Test "Document" "/api/profile/documents" "GET" "PASS (200)" "Fetched $($docsList.Count) documents"
} catch {
    Record-Test "Document" "/api/profile/documents" "GET" "FAIL" $_.Exception.Message
}

if ($docId) {
    try {
        $delDoc = Invoke-RestMethod -Uri "$baseUrl/api/profile/documents/$docId" -Method Delete -Headers $tHeaders
        Record-Test "Document" "/api/profile/documents/{id}" "DELETE" "PASS (200)" "Deleted document $($docId)"
    } catch {
        Record-Test "Document" "/api/profile/documents/{id}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# 10. MEASUREMENT CONTROLLER
try {
    $measBody = @{
        height = "5'10"
        bust = "34"
        waist = "26"
        hips = "36"
        dressSize = "S"
        shoeSize = "7"
        hairColor = "Black"
        eyeColor = "Brown"
        skinTone = "Fair"
        bodyType = "Athletic"
    } | ConvertTo-Json
    $measCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/measurements" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $measBody
    Record-Test "Measurement" "/api/profile/measurements" "POST" "PASS (200)" "Created measurements: Height $($measCreate.height), Waist $($measCreate.waist)"
} catch {
    Record-Test "Measurement" "/api/profile/measurements" "POST" "FAIL" $_.Exception.Message
}

try {
    $measGet = Invoke-RestMethod -Uri "$baseUrl/api/profile/measurements" -Method Get -Headers $tHeaders
    Record-Test "Measurement" "/api/profile/measurements" "GET" "PASS (200)" "Fetched measurements: Bust $($measGet.bust), Waist $($measGet.waist)"
} catch {
    Record-Test "Measurement" "/api/profile/measurements" "GET" "FAIL" $_.Exception.Message
}

try {
    $measUpdBody = @{
        height = "5'10"
        bust = "34"
        waist = "25.5"
        hips = "36"
        dressSize = "XS"
        shoeSize = "7"
        hairColor = "Dark Brown"
        eyeColor = "Brown"
        skinTone = "Fair"
        bodyType = "Slim"
    } | ConvertTo-Json
    $measUpd = Invoke-RestMethod -Uri "$baseUrl/api/profile/measurements" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $measUpdBody
    Record-Test "Measurement" "/api/profile/measurements" "PUT" "PASS (200)" "Updated: Waist $($measUpd.waist), Size $($measUpd.dressSize)"
} catch {
    Record-Test "Measurement" "/api/profile/measurements" "PUT" "FAIL" $_.Exception.Message
}

# 11. WORK EXPERIENCE CONTROLLER
$expId = $null
try {
    $expBody = @{
        projectTitle = "Lakme Fashion Week Autumn Showcase"
        roleOrCharacter = "Lead Runway Model"
        productionOrBrand = "Lakme Studio"
        directorOrAgency = "IMG Models"
        year = 2025
        description = "Walked the opening runway for prime designer collections."
        projectUrl = "https://lakmefashionweek.co.in"
    } | ConvertTo-Json
    $expCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/work-experience" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $expBody
    $expId = $expCreate.id
    Record-Test "Work Experience" "/api/profile/work-experience" "POST" "PASS (201)" "Added experience ID $($expId)"
} catch {
    Record-Test "Work Experience" "/api/profile/work-experience" "POST" "FAIL" $_.Exception.Message
}

try {
    $exps = Invoke-RestMethod -Uri "$baseUrl/api/profile/work-experience" -Method Get -Headers $tHeaders
    Record-Test "Work Experience" "/api/profile/work-experience" "GET" "PASS (200)" "Fetched $($exps.Count) experiences"
} catch {
    Record-Test "Work Experience" "/api/profile/work-experience" "GET" "FAIL" $_.Exception.Message
}

if ($expId) {
    try {
        $expUpdBody = @{
            projectTitle = "Lakme Fashion Week Finale"
            roleOrCharacter = "Showstopper"
            productionOrBrand = "Lakme Studio"
            year = 2025
            description = "Showstopper for Grand Finale."
        } | ConvertTo-Json
        $expUpd = Invoke-RestMethod -Uri "$baseUrl/api/profile/work-experience/$expId" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $expUpdBody
        Record-Test "Work Experience" "/api/profile/work-experience/{id}" "PUT" "PASS (200)" "Updated title: $($expUpd.projectTitle)"
    } catch {
        Record-Test "Work Experience" "/api/profile/work-experience/{id}" "PUT" "FAIL" $_.Exception.Message
    }

    try {
        $delExp = Invoke-RestMethod -Uri "$baseUrl/api/profile/work-experience/$expId" -Method Delete -Headers $tHeaders
        Record-Test "Work Experience" "/api/profile/work-experience/{id}" "DELETE" "PASS (200)" "Deleted experience $($expId)"
    } catch {
        Record-Test "Work Experience" "/api/profile/work-experience/{id}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# 12. RATE PACKAGE CONTROLLER
$pkgId = $null
try {
    $pkgBody = @{
        packageName = "Full Day Fashion Shoot"
        price = 45000.00
        duration = "8 Hours"
        features = @("Up to 6 outfit changes", "10 retouched master images", "Full studio access")
        mostPopular = $true
        customPrice = $false
    } | ConvertTo-Json
    $pkgCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/rates" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $pkgBody
    $pkgId = $pkgCreate.id
    Record-Test "Rate Package" "/api/profile/rates" "POST" "PASS (201)" "Created package ID $($pkgId)"
} catch {
    Record-Test "Rate Package" "/api/profile/rates" "POST" "FAIL" $_.Exception.Message
}

try {
    $pkgs = Invoke-RestMethod -Uri "$baseUrl/api/profile/rates/user/$talentId" -Method Get -Headers $tHeaders
    Record-Test "Rate Package" "/api/profile/rates/user/{userId}" "GET" "PASS (200)" "Fetched $($pkgs.Count) packages for talent $($talentId)"
} catch {
    Record-Test "Rate Package" "/api/profile/rates/user/{userId}" "GET" "FAIL" $_.Exception.Message
}

if ($pkgId) {
    try {
        $pkgGet = Invoke-RestMethod -Uri "$baseUrl/api/profile/rates/$pkgId" -Method Get -Headers $tHeaders
        Record-Test "Rate Package" "/api/profile/rates/{packageId}" "GET" "PASS (200)" "Fetched package: $($pkgGet.packageName) - Price $($pkgGet.price)"
    } catch {
        Record-Test "Rate Package" "/api/profile/rates/{packageId}" "GET" "FAIL" $_.Exception.Message
    }

    try {
        $pkgUpdBody = @{
            packageName = "Full Day Commercial Shoot (Premium)"
            price = 55000.00
            duration = "10 Hours"
            features = @("Unlimited changes", "Hair and makeup included")
            mostPopular = $true
            customPrice = $false
        } | ConvertTo-Json
        $pkgUpd = Invoke-RestMethod -Uri "$baseUrl/api/profile/rates/$pkgId" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $pkgUpdBody
        Record-Test "Rate Package" "/api/profile/rates/{packageId}" "PUT" "PASS (200)" "Updated price to $($pkgUpd.price)"
    } catch {
        Record-Test "Rate Package" "/api/profile/rates/{packageId}" "PUT" "FAIL" $_.Exception.Message
    }

    try {
        $delPkg = Invoke-RestMethod -Uri "$baseUrl/api/profile/rates/$pkgId" -Method Delete -Headers $tHeaders
        Record-Test "Rate Package" "/api/profile/rates/{packageId}" "DELETE" "PASS (200)" "Deleted package $($pkgId)"
    } catch {
        Record-Test "Rate Package" "/api/profile/rates/{packageId}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# 13. REVIEW CONTROLLER
$revId = $null
try {
    $revBody = @{
        profileUserId = $talentId
        rating = 5
        comment = "Exceptional professionalism on set, delivered outstanding runway performance!"
        projectName = "LFW Campaign"
    } | ConvertTo-Json
    $revCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/reviews" -Method Post -ContentType "application/json" -Headers $cHeaders -Body $revBody
    $revId = $revCreate.id
    Record-Test "Review" "/api/profile/reviews" "POST" "PASS (201)" "Client created review ID $($revId)"
} catch {
    Record-Test "Review" "/api/profile/reviews" "POST" "FAIL" $_.Exception.Message
}

try {
    $revs = Invoke-RestMethod -Uri "$baseUrl/api/profile/reviews/$talentId" -Method Get -Headers $tHeaders
    Record-Test "Review" "/api/profile/reviews/{profileUserId}" "GET" "PASS (200)" "Fetched $($revs.Count) reviews for talent $($talentId)"
} catch {
    Record-Test "Review" "/api/profile/reviews/{profileUserId}" "GET" "FAIL" $_.Exception.Message
}

if ($revId) {
    try {
        $revUpdBody = @{
            rating = 5
            comment = "Updated: Absolute top-tier talent to work with! Highly recommended."
            projectName = "LFW Campaign Finale"
        } | ConvertTo-Json
        $revUpd = Invoke-RestMethod -Uri "$baseUrl/api/profile/reviews/$revId" -Method Put -ContentType "application/json" -Headers $cHeaders -Body $revUpdBody
        Record-Test "Review" "/api/profile/reviews/{reviewId}" "PUT" "PASS (200)" "Updated review rating: $($revUpd.rating)"
    } catch {
        Record-Test "Review" "/api/profile/reviews/{reviewId}" "PUT" "FAIL" $_.Exception.Message
    }

    try {
        $delRev = Invoke-RestMethod -Uri "$baseUrl/api/profile/reviews/$revId" -Method Delete -Headers $cHeaders
        Record-Test "Review" "/api/profile/reviews/{reviewId}" "DELETE" "PASS (200)" "Deleted review $($revId)"
    } catch {
        Record-Test "Review" "/api/profile/reviews/{reviewId}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# 14. AVAILABILITY CONTROLLER
$availId = $null
$testDate = "2026-11-20"
$testDate2 = "2026-11-25"

try {
    $availBody = @{
        availabilityDate = $testDate
        status = "AVAILABLE"
        description = "Open for outdoor fashion shoots"
        startTime = "08:00:00"
        endTime = "17:00:00"
    } | ConvertTo-Json
    $availCreate = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $availBody
    $availId = $availCreate.id
    Record-Test "Availability" "/api/profile/availability" "POST" "PASS (201)" "Created slot ID $($availId) on $($testDate)"
} catch {
    Record-Test "Availability" "/api/profile/availability" "POST" "FAIL" $_.Exception.Message
}

try {
    $availBody2 = @{
        availabilityDate = $testDate2
        status = "BOOKED"
        description = "Booked for Vogue Shoot"
        startTime = "09:00:00"
        endTime = "18:00:00"
    } | ConvertTo-Json
    $availCreate2 = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $availBody2
    $availId2 = $availCreate2.id
    Record-Test "Availability" "/api/profile/availability (2nd slot)" "POST" "PASS (201)" "Created slot ID $($availId2) on $($testDate2)"
} catch {
    Record-Test "Availability" "/api/profile/availability (2nd slot)" "POST" "FAIL" $_.Exception.Message
}

try {
    $myAvail = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/my" -Method Get -Headers $tHeaders
    Record-Test "Availability" "/api/profile/availability/my" "GET" "PASS (200)" "Fetched $($myAvail.Count) slots for logged-in user"
} catch {
    Record-Test "Availability" "/api/profile/availability/my" "GET" "FAIL" $_.Exception.Message
}

try {
    $userAvail = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/user/$talentId" -Method Get -Headers $tHeaders
    Record-Test "Availability" "/api/profile/availability/user/{userId}" "GET" "PASS (200)" "Fetched $($userAvail.Count) slots for talent ID $($talentId)"
} catch {
    Record-Test "Availability" "/api/profile/availability/user/{userId}" "GET" "FAIL" $_.Exception.Message
}

try {
    $availDates = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/user/$talentId/available" -Method Get -Headers $tHeaders
    Record-Test "Availability" "/api/profile/availability/user/{userId}/available" "GET" "PASS (200)" "Found $($availDates.Count) available slots"
} catch {
    Record-Test "Availability" "/api/profile/availability/user/{userId}/available" "GET" "FAIL" $_.Exception.Message
}

try {
    $dateSlot = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/user/$talentId/date/$testDate" -Method Get -Headers $tHeaders
    Record-Test "Availability" "/api/profile/availability/user/{userId}/date/{date}" "GET" "PASS (200)" "Slot status on $($testDate) is $($dateSlot.status)"
} catch {
    Record-Test "Availability" "/api/profile/availability/user/{userId}/date/{date}" "GET" "FAIL" $_.Exception.Message
}

try {
    $nextDate = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/user/$talentId/next" -Method Get -Headers $tHeaders
    Record-Test "Availability" "/api/profile/availability/user/{userId}/next" "GET" "PASS (200)" "Next available date: $($nextDate.availabilityDate)"
} catch {
    Record-Test "Availability" "/api/profile/availability/user/{userId}/next" "GET" "FAIL" $_.Exception.Message
}

if ($availId) {
    try {
        $availUpdBody = @{
            availabilityDate = $testDate
            status = "TENTATIVE"
            description = "Hold for Lakme Commercial"
            startTime = "09:00:00"
            endTime = "18:00:00"
        } | ConvertTo-Json
        $availUpd = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/$availId" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $availUpdBody
        Record-Test "Availability" "/api/profile/availability/{availabilityId}" "PUT" "PASS (200)" "Updated status to $($availUpd.status)"
    } catch {
        Record-Test "Availability" "/api/profile/availability/{availabilityId}" "PUT" "FAIL" $_.Exception.Message
    }

    try {
        $delDateResp = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/date/$testDate" -Method Delete -Headers $tHeaders
        Record-Test "Availability" "/api/profile/availability/date/{date}" "DELETE" "PASS (200)" "Deleted slot for $($testDate)"
    } catch {
        Record-Test "Availability" "/api/profile/availability/date/{date}" "DELETE" "FAIL" $_.Exception.Message
    }
}

if ($availId2) {
    try {
        $delSlotResp = Invoke-RestMethod -Uri "$baseUrl/api/profile/availability/$availId2" -Method Delete -Headers $tHeaders
        Record-Test "Availability" "/api/profile/availability/{availabilityId}" "DELETE" "PASS (200)" "Deleted slot ID $($availId2)"
    } catch {
        Record-Test "Availability" "/api/profile/availability/{availabilityId}" "DELETE" "FAIL" $_.Exception.Message
    }
}

# Clean temp file
Remove-Item -Force $tempFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=================================================="
Write-Host "TEST EXECUTION SUMMARY"
Write-Host "=================================================="
$results | Format-Table Category, Method, Endpoint, Status, Notes -AutoSize

$passed = ($results | Where-Object { $_.Status -like "PASS*" }).Count
$failed = ($results | Where-Object { $_.Status -like "FAIL*" }).Count
Write-Host ""
Write-Host "Total Tests Run: $($results.Count) | PASSED: $passed | FAILED: $failed"
