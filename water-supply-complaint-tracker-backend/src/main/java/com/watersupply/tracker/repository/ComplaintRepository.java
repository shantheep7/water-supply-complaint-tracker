package com.watersupply.tracker.repository;

import com.watersupply.tracker.entity.Complaint;
import com.watersupply.tracker.entity.ComplaintStatus;
import com.watersupply.tracker.entity.ComplaintType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA writes the SQL for us: we only declare the methods.
 * JpaRepository already provides save(), findById(), findAll(), count(), delete() ...
 *
 * @EntityGraph(attributePaths = "history") loads each complaint's timeline in the same
 * query, instead of one extra query per complaint (the "N+1 queries" problem).
 */
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    @EntityGraph(attributePaths = "history")
    Optional<Complaint> findByComplaintCode(String complaintCode);

    /**
     * All complaints, newest first. Every filter is optional: a null parameter is ignored.
     * {@code search} must already be lower-case and wrapped in % wildcards.
     */
    @EntityGraph(attributePaths = "history")
    @Query("""
            SELECT c FROM Complaint c
            WHERE (:area IS NULL OR c.area = :area)
              AND (:type IS NULL OR c.type = :type)
              AND (:status IS NULL OR c.status = :status)
              AND (:search IS NULL
                   OR LOWER(c.complaintCode) LIKE :search
                   OR LOWER(c.residentName) LIKE :search
                   OR c.phone LIKE :search)
            ORDER BY c.createdAt DESC, c.id DESC
            """)
    List<Complaint> search(@Param("area") String area,
                           @Param("type") ComplaintType type,
                           @Param("status") ComplaintStatus status,
                           @Param("search") String search);
}
