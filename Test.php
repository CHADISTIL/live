<?php
// دالة لاسترجاع محتوى HTML من URL
function getHTMLContent($url) {
    // التحقق من أن الوظيفة cURL متاحة
    if (!function_exists('curl_init')) {
        return "المكتبة cURL غير مفعلة على الخادم";
    }
    
    // تهيئة جلسة cURL
    $ch = curl_init();
    
    // تعيين خيارات cURL
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
    
    // إضافة الرؤوس HTTP المطلوبة
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.5',
        'Connection: keep-alive',
        'Upgrade-Insecure-Requests: 1',
        'Cache-Control: max-age=0'
    ));
    
    // تنفيذ الطلب واسترجاع المحتوى
    $htmlContent = curl_exec($ch);
    
    // التحقق من وجود أخطاء
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return "حدث خطأ أثناء جلب المحتوى: " . $error;
    }
    
    // إغلاق جلسة cURL
    curl_close($ch);
    
    return $htmlContent;
}

// صفحة الويب التي تريد استخراج محتواها
$websiteURL = "https://example.com"; // استبدل هذا بالرابط المطلوب

// جلب محتوى HTML
$html = getHTMLContent($websiteURL);

// عرض المحتوى كنص في الصفحة
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>محتوى الموقع</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .url-input {
            width: 80%;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .submit-btn {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>مستخرج محتوى HTML</h1>
    
    <form method="post">
        <input type="url" name="website_url" class="url-input" placeholder="أدخل رابط الموقع (مثال: https://example.com)" required>
        <button type="submit" class="submit-btn">جلب المحتوى</button>
    </form>
    
    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['website_url'])) {
        $websiteURL = filter_var($_POST['website_url'], FILTER_SANITIZE_URL);
        $html = getHTMLContent($websiteURL);
    }
    ?>
    
    <?php if (isset($html) && is_string($html)): ?>
        <h2>محتوى HTML للموقع: <?php echo htmlspecialchars($websiteURL); ?></h2>
        <pre><?php echo htmlspecialchars($html); ?></pre>
    <?php elseif (isset($html)): ?>
        <p style="color: red;"><?php echo $html; ?></p>
    <?php endif; ?>
</body>
</html>
