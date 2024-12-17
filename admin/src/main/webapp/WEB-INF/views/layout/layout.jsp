<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>사내 업무 관리 시스템</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="/css/style.css" rel="stylesheet">  <!-- 마지막에 로드하여 우선순위 확보 -->
</head>
<body>
    <div class="wrapper">
        <!-- Sidebar -->
        <jsp:include page="sidebar.jsp" />

        <div class="main-content">
            <!-- Header -->
            <jsp:include page="header.jsp" />

            <!-- Main Content -->
            <main class="content-wrapper">
                <jsp:include page="${content}" />
            </main>

            <!-- Footer -->
            <jsp:include page="footer.jsp" />
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
