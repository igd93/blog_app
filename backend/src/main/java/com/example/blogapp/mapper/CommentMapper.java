package com.example.blogapp.mapper;

import com.example.blogapp.dto.CommentDTO;
import com.example.blogapp.entity.Comment;
import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import com.example.blogapp.repository.BlogPostRepository;
import com.example.blogapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CommentMapper {
    private final ModelMapper mapper;
    private final UserMapper userMapper;
    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;

    public CommentDTO toDTO(Comment comment) {
        CommentDTO dto = mapper.map(comment, CommentDTO.class);
        if (comment.getUser() != null) {
            dto.setAuthor(userMapper.toDTO(comment.getUser()));
        }
        if (comment.getPost() != null) {
            dto.setPostId(comment.getPost().getId());
        }
        return dto;
    }

    public Comment toEntity(CommentDTO dto) {
        Comment comment = new Comment();

        // Set basic properties
        comment.setId(dto.getId());
        comment.setContent(dto.getContent());

        // Set post if postId is provided
        if (dto.getPostId() != null) {
            Optional<BlogPost> post = blogPostRepository.findById(dto.getPostId());
            post.ifPresent(comment::setPost);
        }

        // Set user if author is provided
        if (dto.getAuthor() != null && dto.getAuthor().getId() != null) {
            Optional<User> user = userRepository.findById(dto.getAuthor().getId());
            user.ifPresent(comment::setUser);
        }

        return comment;
    }
}