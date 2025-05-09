from ..db.mongo import db
from statistics import mean
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# class Student:
#     def __init__(self, doc):
#         self.id = str(doc["_id"])
#         self.first_name = doc["first_name"]
#         self.last_name = doc["last_name"]
#         self.time_zone = doc["time_zone"]
#         self.learning_goals = doc.get("learning_goals", [])
#         self.preferred_languages = doc.get("preferred_languages", [])
#         self.bio = doc.get("bio", "")

#         # Dynamically build a tutor_id -> rating dictionary from reviews
#         review_docs = list(db.reviews.find({"student_id": self.id}))
#         self.ratings = {
#             review["expert_id"]: review["rating"]
#             for review in review_docs
#             if "rating" in review and "expert_id" in review
#         }

# class Tutor:
#     def __init__(self, doc):
#         self.id = str(doc["_id"])
#         self.name = doc["name"]
#         self.skills = doc.get("skills", [])
#         self.time_zone = doc["time_zone"]
#         self.hourly_rate = doc["hourly_rate"]
#         self.spoken_languages = doc.get("spoken_languages", [])
#         self.experience_years = doc["experience_years"]
#         self.education = doc["education"]
#         self.teaching_style = doc["teaching_style"]
#         self.bio = doc.get("bio", "")
#         self.sessions_completed = doc.get("sessions_completed", 0)

#         # Load ratings from reviews collection
#         reviews = list(db.reviews.find({"expert_id": self.id}))
#         self.ratings = [review["rating"] for review in reviews if "rating" in review]

#         self.avg_rating = round(mean(self.ratings), 2) if self.ratings else 0.0


# class HybridRecommender:
#     def __init__(self, students: List[Student], tutors: List[Tutor]):
#         self.students = {s.id: s for s in students}
#         self.tutors = tutors

#     def content_score(self, student: Student, tutor: Tutor) -> float:
#         vectorizer = TfidfVectorizer()
#         student_text = " ".join(student.learning_goals + student.preferred_languages + [student.bio])
#         tutor_text = " ".join(tutor.skills + tutor.spoken_languages + [tutor.bio])

#         tfidf = vectorizer.fit_transform([student_text, tutor_text])
#         score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
#         return score

#     def collaborative_score(self, student: Student, tutor: Tutor) -> float:
#         # Compute cosine similarity of ratings
#         tutor_vector = []
#         student_vector = []

#         for other_student in self.students.values():
#             if tutor.id in other_student.ratings:
#                 tutor_vector.append(other_student.ratings[tutor.id])
#                 student_vector.append(student.ratings.get(tutor.id, 0))

#         if not tutor_vector or not any(student_vector):
#             return 0.0

#         tutor_array = np.array(tutor_vector)
#         student_array = np.array(student_vector)

#         norm_product = np.linalg.norm(tutor_array) * np.linalg.norm(student_array)
#         if norm_product == 0:
#             return 0.0
#         return float(np.dot(tutor_array, student_array) / norm_product)

#     def recommend(self, student_id: str, top_n: int = 3) -> List[Tuple[Tutor, float]]:
#         if student_id not in self.students:
#             return []

#         student = self.students[student_id]
#         scores = []

#         for tutor in self.tutors:
#             content = self.content_score(student, tutor)
#             collaborative = self.collaborative_score(student, tutor)
#             hybrid = 0.7 * content + 0.3 * collaborative
#             scores.append((tutor, hybrid))

#         scores.sort(key=lambda x: x[1], reverse=True)
#         return scores[:top_n]


class Student:
    def __init__(self, doc):
        self.id = str(doc["_id"])
        self.first_name = doc["first_name"]
        self.last_name = doc["last_name"]
        self.time_zone = doc["time_zone"]
        self.learning_goals = doc.get("learning_goals", [])
        self.preferred_languages = doc.get("preferred_languages", [])
        self.bio = doc.get("bio", "")

        # Dynamically build a tutor_id -> rating dictionary from reviews
        review_docs = list(db.reviews.find({"student_id": self.id}))
        self.ratings = {
            review["expert_id"]: review["rating"]
            for review in review_docs
            if "rating" in review and "expert_id" in review
        }

class Tutor:
    def __init__(self, doc):
        self.id = str(doc["_id"])
        self.name = doc["first_name"] + " " + doc["last_name"]
        self.skills = doc.get("tags", [])
        self.hourly_rate = doc["hourly_rate"]
        self.spoken_languages = doc.get("languages", [])
        self.experience_years = doc["experience_years"]
        self.education = doc["education"]
        self.teaching_style = doc["teaching_style"]
        self.bio = doc.get("bio", "")
        self.sessions_completed = doc.get("completed_sessions", 0)

        # Load ratings from reviews collection
        reviews = list(db.reviews.find({"expert_id": self.id}))
        self.ratings = [review["rating"] for review in reviews if "rating" in review]
        self.avg_rating = round(mean(self.ratings), 2) if self.ratings else 0.0


class HybridRecommender:
    def __init__(self, students: List[Student], tutors: List[Tutor]):
        self.students = {s.id: s for s in students}
        self.tutors = tutors


    def content_score(self, student: Student, tutor: Tutor) -> float:
        
        vectorizer = TfidfVectorizer()
        student_text = " ".join(student.learning_goals + student.preferred_languages + [student.bio])
        tutor_text = " ".join(tutor.skills + tutor.spoken_languages + [tutor.bio])

        try:
            tfidf = vectorizer.fit_transform([student_text, tutor_text])
            score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    
            return score
        except Exception as e:
            return 0.0

    def collaborative_score(self, student: Student, tutor: Tutor) -> float:
    
        # If the student hasn't rated any tutors, or this specific tutor
        # doesn't have any ratings from other students
        if not student.ratings:
            return 0.0
            
        if tutor.id not in [t.id for t in self.tutors]:
            return 0.0
            
        # Find students who have rated the same tutors as our target student
        similar_students = []
        
        for other_id, other_student in self.students.items():
            if other_id == student.id:
                continue
                
            if not other_student.ratings:
                continue
                
            # Find common tutors that both students have rated
            common_tutors = set(student.ratings.keys()) & set(other_student.ratings.keys())
            
            if not common_tutors:
                continue
                
            # Create vectors of ratings for common tutors
            student_ratings = [student.ratings[t_id] for t_id in common_tutors]
            other_ratings = [other_student.ratings[t_id] for t_id in common_tutors]
            
            # Calculate similarity between students
            if len(student_ratings) > 0:
                student_array = np.array(student_ratings)
                other_array = np.array(other_ratings)
                
                norm_product = np.linalg.norm(student_array) * np.linalg.norm(other_array)
                if norm_product == 0:
                    similarity = 0.0
                else:
                    similarity = float(np.dot(student_array, other_array) / norm_product)
                
                # Check if other student has rated our target tutor
                if tutor.id in other_student.ratings:
                    similar_students.append((similarity, other_student.ratings[tutor.id]))
        
        # If no similar students found who rated this tutor
        if not similar_students:
            return 0.0
            
        # Calculate weighted average of ratings
        total_similarity = sum(sim for sim, _ in similar_students)
        if total_similarity == 0:
            return 0.0
            
        weighted_sum = sum(sim * rating for sim, rating in similar_students)
        final_score = weighted_sum / total_similarity
        return final_score

    def recommend(self, student_id: str, top_n: int = 3) -> List[Tuple[Tutor, float]]:
        if student_id not in self.students:
            return []

        student = self.students[student_id]
        scores = []

        for i, tutor in enumerate(self.tutors):

            content = self.content_score(student, tutor)
            collaborative = self.collaborative_score(student, tutor)
            hybrid = 0.7 * content + 0.3 * collaborative
            scores.append((tutor, hybrid))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_n]