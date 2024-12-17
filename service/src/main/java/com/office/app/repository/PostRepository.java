package com.office.app.repository;

import com.office.app.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByBoardIdOrderByCreatedAtDesc(Long boardId);
    List<Post> findByBoardIdAndAuthorEmployeeId(Long boardId, String employeeId);
    Page<Post> findByBoardIdOrderByCreatedAtDesc(Long boardId, Pageable pageable);

    // 검색 기능을 위한 메서드
    @Query("SELECT p FROM Post p WHERE p.boardId = :boardId AND " +
           "(p.title LIKE %:keyword% OR p.content LIKE %:keyword% OR p.authorEmployeeId LIKE %:keyword%)")
    List<Post> searchPosts(@Param("boardId") Long boardId, @Param("keyword") String keyword);

    @Query("SELECT p FROM Post p WHERE p.boardId = :boardId AND " +
            "(p.title LIKE %:keyword% OR p.content LIKE %:keyword% OR p.authorEmployeeId LIKE %:keyword%)")
    Page<Post> searchPosts(
            @Param("boardId") Long boardId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("SELECT p FROM Post p " +
            "JOIN FETCH p.board b " +
            "WHERE p.boardId = :boardId " +
            "ORDER BY p.createdAt DESC")
    List<Post> findByBoardIdWithBoard(@Param("boardId") Long boardId);
    // 게시판별 전체 게시글 수 조회 메서드
    long countByBoardId(Long boardId);

    // 검색 결과의 전체 게시글 수 조회 메서드
    @Query("SELECT COUNT(p) FROM Post p WHERE p.boardId = :boardId AND " +
            "(p.title LIKE %:keyword% OR p.content LIKE %:keyword% OR p.authorEmployeeId LIKE %:keyword%)")
    long countSearchResults(@Param("boardId") Long boardId, @Param("keyword") String keyword);
}