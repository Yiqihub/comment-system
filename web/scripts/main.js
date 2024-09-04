document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.querySelector('.submit');
    const nameInput = document.getElementById('name');
    const commentInput = document.getElementById('comment');
    const historyList = document.getElementById('historyList');
    const commentsPerPage = 10;
    let currentPage = 1;
    let totalComments = 0;

    // 提交新评论
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        const name = nameInput.value.trim();
        const comment = commentInput.value.trim();

        if (name && comment) {
            const newComment = { name, content: comment };
            fetch('http://localhost:8080/comment/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newComment)
            })
            .then(response => response.json())
            .then(data => {
                if (data.code === 0) {
                    // 提交成功后，跳转到最后一页并加载该页的评论
                    totalComments += 1; // 假设提交成功后总评论数+1
                    currentPage = Math.ceil(totalComments / commentsPerPage); // 计算最后一页的页码
                    loadCommentsForPage(currentPage);
                    
                    nameInput.value = '';
                    commentInput.value = '';
                } else {
                    alert('提交失败：' + data.msg);
                }
            })
            .catch(() => {
                alert('提交失败，请稍后再试');
            });
        } else {
            alert('姓名和评论内容不能为空！');
        }
    });

    // 加载评论列表
    function loadCommentsForPage(page) {
        fetch(`http://localhost:8080/comment/get?page=${page}&size=${commentsPerPage}`)
            .then(response => response.json())
            .then(data => {
                if (data.code === 0) {
                    totalComments = data.data.total;
                    const comments = data.data.comments;

                    // 清空历史评论
                    historyList.innerHTML = '';

                    comments.forEach(comment => {
                        const commentElement = createCommentElement(comment);
                        historyList.appendChild(commentElement);
                    });

                    setupDeleteEventListeners();
                    updatePagination();
                } else {
                    alert('加载评论失败：' + data.msg);
                }
            })
            .catch(() => {
                alert('加载评论失败，请稍后再试');
            });
    }

    function createCommentElement(comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'history';
        commentElement.dataset.id = comment.id; // Store comment ID in data attribute
        commentElement.innerHTML = `
            <h3>${comment.name}</h3>
            <p>${comment.content}</p>
            <div class="delete" data-id="${comment.id}">删除</div>
        `;
        return commentElement;
    }

    function setupDeleteEventListeners() {
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', deleteCommentHandler); 
        });
    }

    function deleteCommentHandler(event) {
        event.preventDefault();
        const commentId = event.target.getAttribute('data-id');

        fetch(`http://localhost:8080/comment/delete?id=${commentId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 0) {
                // 删除成功后检查是否需要翻页
                const commentsOnCurrentPage = document.querySelectorAll('.history').length;

                if (commentsOnCurrentPage === 1 && currentPage > 1) {
                    // 当前页只有一条评论且不是第一页，翻到前一页
                    currentPage--;
                }

                // 重新加载评论
                totalComments -= 1; // 删除成功后减少总评论数
                loadCommentsForPage(currentPage);
            } else {
                alert('删除失败：' + data.msg);
            }
        })
        .catch(() => {
            alert('删除失败，请稍后再试');
        });
    }

    function updatePagination() {
        const pageCount = Math.ceil(totalComments / commentsPerPage);
        document.querySelector('.next').disabled = (currentPage >= pageCount);
        document.querySelector('.prev').disabled = (currentPage <= 1);
    }

    document.querySelector('.prev').addEventListener('click', function(event) {
        if (currentPage > 1) {
            currentPage--;
            loadCommentsForPage(currentPage);
        }
    });

    document.querySelector('.next').addEventListener('click', function(event) {
        const pageCount = Math.ceil(totalComments / commentsPerPage);
        if (currentPage < pageCount) {
            currentPage++;
            loadCommentsForPage(currentPage);
        }
    });

    // 初始化加载评论
    loadCommentsForPage(currentPage);
});
