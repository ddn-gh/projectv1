from exts import db
from datetime import datetime, timedelta

class ASTtest(db.Model):
    __tablename__ = 'asttest'
    
    test_id = db.Column(db.Integer(), primary_key=True)
    bacteria_name = db.Column(db.String(), nullable=False)
    username = db.Column(db.String(), db.ForeignKey('user.username'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)
    
    image_filename = db.Column(db.String(), nullable=True)
    
    user = db.relationship('User', back_populates='tests')
    inhibition_zones = db.relationship('InhibitionZone', back_populates='test')
    history = db.relationship('TestHistory', back_populates='test', overlaps="test_history")
    inhibition_zone_history = db.relationship('InhibitionZoneHistory', back_populates='test')
    
    def __repr__(self):
        return f"<Test {self.bacteria_name} >"

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self, new_bac, new_user):
        self.bacteria_name = new_bac
        self.username = new_user
        db.session.commit()
    
    def to_dict(self):
        return {
        'test_id': self.test_id,
        'bacteria_name': self.bacteria_name,
        'username': self.username,
        'inhibition_zone_history': [zone.to_dict() for zone in self.inhibition_zone_history]
    }
        
class TestHistory(db.Model):
    __tablename__ = 'test_history'
    
    history_id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    test_id = db.Column(db.Integer(), db.ForeignKey('asttest.test_id', ondelete='SET NULL'), nullable=True) 
    username = db.Column(db.String(), db.ForeignKey('user.username', ondelete='SET NULL'), nullable=True)  
    old_value = db.Column(db.String(), nullable=True)
    new_value = db.Column(db.String(), nullable=True)
    edit_at = db.Column(db.DateTime, nullable=True)
    
    test = db.relationship('ASTtest', back_populates='history', overlaps="test_history")
    user = db.relationship('User', back_populates='test_history', overlaps="test_history")
    
    def __repr__(self):
        return f"<Test {self.test_id} changed by User {self.user_id}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        
    def update(self, new_bacteria, username):
        if new_bacteria != self.diameter:
            log = InhibitionZoneHistory(
                inhibition_zone_id=self.zone_id,
                old_value=self.diameter,
                new_value=new_bacteria,
                username=username
            )
            db.session.add(log)
            self.diameter = new_bacteria
        db.session.commit()
    
    
class InhibitionZone(db.Model):
    __tablename__ = 'inhibition_zone'
    
    zone_id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('asttest.test_id', ondelete='SET NULL'), nullable=False) 

    antibiotic_name = db.Column(db.String(), nullable=True)
    diameter = db.Column(db.Float(), nullable=True)
    
    pixel = db.Column(db.Float(), nullable=True)
    
    resistant = db.Column(db.String(), nullable=True)
    username = db.Column(db.String(), db.ForeignKey('user.username'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)
    
    test = db.relationship('ASTtest', back_populates='inhibition_zones')
    user = db.relationship('User', back_populates='inhibition_zones') 

    def __repr__(self):
        return f"<InhibitionZone {self.zone_id} for Test {self.test_id}>"

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
        
    def update(self, new_antibiotic, new_diameter, new_sir):
        self.antibiotic_name = new_antibiotic
        self.diameter = new_diameter
        self.resistant = new_sir
        db.session.commit()

        
class InhibitionZoneHistory(db.Model):
    __tablename__ = 'inhibition_zone_history'
    
    history_id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    test_id = db.Column(db.Integer(), db.ForeignKey('asttest.test_id', ondelete='SET NULL'), nullable=False) 
    
    number_of_test = db.Column(db.Integer(), nullable=True)
    antibiotic_name = db.Column(db.String(), nullable=True)
    diameter = db.Column(db.Float(), nullable=True)
    resistant = db.Column(db.String(), nullable=True)
    username = db.Column(db.String(), db.ForeignKey('user.username'), nullable=True)
    edit_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', back_populates='zone_history')
    test = db.relationship('ASTtest', back_populates='inhibition_zone_history')
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def __repr__(self):
        return f"<Zone {self.inhibition_zone_id} changed by User {self.username}>"
    
    def to_dict(self):
        return {
        'number_of_test': self.number_of_test,
        'antibiotic_name': self.antibiotic_name,
        'diameter': self.diameter,
        'resistant': self.resistant
    }
        
class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    
    tests = db.relationship('ASTtest', back_populates='user')
    test_history = db.relationship('TestHistory', back_populates='user', overlaps="test_history")
    zone_history = db.relationship('InhibitionZoneHistory', back_populates='user')
    inhibition_zones = db.relationship('InhibitionZone', back_populates='user') 

    def __repr__(self):
        return f"<User {self.username}>"

    def save(self):
        db.session.add(self)
        db.session.commit()