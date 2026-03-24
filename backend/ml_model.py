from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
import numpy as np
import json

class SimpleChatbotML:
    def __init__(self, db_path):
        self.vectorizer = TfidfVectorizer(lowercase=True)
        self.classifier = LinearSVC()
        
        with open(db_path, 'r', encoding='utf-8') as f:
            self.locations = json.load(f)
            
        self.location_dict = {loc['name']: loc for loc in self.locations}
        
        training_sentences = []
        training_labels = []
        
        greeting_phrases = ["hello", "hi", "hey", "help", "what can you do", "who are you"]
        for phrase in greeting_phrases:
            training_sentences.append(phrase)
            training_labels.append("greeting")
            
        templates = [
            "where is the {}",
            "how do i go to the {}",
            "tell me about the {}",
            "what floor is the {}",
            "give me info on {}",
            "location of {}",
            "{}",
            "which level is the {}",
            "directions for {}",
            "what are the features of {}",
            "facilities at {}",
            "what is near the {}",
            "what landmarks are near {}",
            "what category is {}",
            "type of {}"
        ]
        
        for loc in self.locations:
            names = [loc['name']] + loc.get('aliases', [])
            for n in names:
                for t in templates:
                    training_sentences.append(t.format(n.lower()))
                    training_labels.append(loc['name'])
            
            if 'description' in loc:
                training_sentences.append(loc['description'].lower())
                training_labels.append(loc['name'])
                
            if 'features' in loc:
                for feature in loc['features']:
                    training_sentences.append(f"place with {feature.lower()}")
                    training_labels.append(loc['name'])
                    
        self.training_sentences = training_sentences
        self.training_labels = training_labels
        
    def train(self):
        X = self.vectorizer.fit_transform(self.training_sentences)
        self.classifier.fit(X, self.training_labels)
        
    def predict(self, text):
        X_test = self.vectorizer.transform([text])
        
        if X_test.nnz == 0:
            return "unknown"
            
        prediction = self.classifier.predict(X_test)[0]
        
        decision = self.classifier.decision_function(X_test)
        
        if len(decision.shape) > 1:
            confidence = np.max(decision)
            if confidence < 0.1:  
                return "unknown"
                
        return prediction
        
    def generate_response(self, text):
        intent = self.predict(text)
        
        if intent == "greeting":
            return "Hello! I am your simple AI campus guide. I can tell you where buildings are, what floor they're on, their features, and nearby landmarks. Just ask!"
        elif intent == "unknown":
            return "I'm not sure which location you mean. Try asking me about the Library, Mess, Canteen, or courts."
        else:
            loc = self.location_dict[intent]
            text_lower = text.lower()
            
            if any(word in text_lower for word in ["feature", "facility", "facilities", "have", "inside"]):
                features = ", ".join(loc.get('features', []))
                return f"{loc['name']} features: {features}." if features else f"I don't have specific feature information for {loc['name']}."
            
            elif any(word in text_lower for word in ["landmark", "near", "close", "beside", "around"]):
                landmarks = ", ".join(loc.get('landmarks', []))
                return f"Landmarks near {loc['name']}: {landmarks}." if landmarks else f"I don't have landmark information for {loc['name']}."
            
            elif any(word in text_lower for word in ["category", "type", "kind"]):
                return f"{loc['name']} is categorized as: {loc.get('category', 'unknown')}."
            
            floor_info = loc.get('floor', 'an unknown')
            desc_info = loc.get('description', '')
            response = f"{loc['name']} is on the {floor_info} floor. {desc_info}"
            
            extra_info = []
            if loc.get('landmarks'):
                extra_info.append(f"Nearby: {', '.join(loc['landmarks'])}")
            if loc.get('features'):
                extra_info.append(f"Features: {', '.join(loc['features'])}")
                
            if extra_info:
                response += " " + ". ".join(extra_info) + "."
                
            return response
