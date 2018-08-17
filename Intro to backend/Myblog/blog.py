#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#	  http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import os
import jinja2
import re
import cgi
from google.appengine.ext import db

import random
import string
import hashlib
import hmac

template_dir=os.path.join(os.path.dirname(__file__),'template')
jinja_env=jinja2.Environment(loader=jinja2.FileSystemLoader(template_dir),
autoescape=True)

SECRET="WUWUSHIDALANG"

# for hasing cookie
def hash_str(s):
	return hmac.new(SECRET,s).hexdigest()

def make_secure_val(s):
	return "%s|%s" %(s, hash_str(s))

def check_secure_val(s):
	user_name=s.split("|")[0]
	if make_secure_val(user_name)==s:
		return user_name




# for hasing password
def make_salt():
	return ''.join(random.choice(string.letters) for x in xrange(5))

def make_pw_hash(name, pw, salt=''):
	if not salt:
		salt=make_salt()
	h=hashlib.sha256(name+pw+salt).hexdigest()
	return '%s,%s' %(h,salt)

def valid_pw(name, pw, h):
	salt=h.split(",")[1]
	return h==make_pw_hash(name,pw,salt)

# Base Handlar
class Handlar(webapp2.RequestHandler):
	def write(self, *a, **kw):
		self.response.out.write(*a, **kw)
	
	def render_str(self,template, **params):
		t=jinja_env.get_template(template)
		return t.render(params)
	
	def render(self, template, **kw):
		self.write(self.render_str(template,**kw))

	def set_secure_cookie(self,name,val):
		cookie_val=make_secure_val(val)
		self.response.headers.add_header('Set-Cookie',
		str('%s=%s; Path=/' % (name,cookie_val)))
	
	def read_secure_cookie(self,name):
		cookie_val=self.request.cookies.get(name)
		return cookie_val and check_secure_val(cookie_val)

	def login(self,user):
		self.set_secure_cookie('user_id',str(user.key().id()))
	
	def logout(self,user):
		self.response.headers.add_header('Set-Cookie','user_id=; Path=/')

"""	   def initialize(self,*a,**kw):
		webapp2.RequestHandler.initialize(self,*a,**kw)
		uid=self.read_secure_cookie('user_id')
		self.user=uid and User.by_id(int(uid))"""


def blog_key(name='default'):
	return db.Key.from_path('Blog',name)

def users_key(group='default'):
	return db.Key.from_path('users',group)

class Blog(db.Model):
	subject=db.StringProperty(required=True)
	blog=db.TextProperty(required=True)
	created=db.DateTimeProperty(auto_now_add=True)
	
	def render(self):
		self._render_text=self.blog.replace('\n', '<br>')
		return self._render_text

class User(db.Model):
	name=db.StringProperty(required=True)
	pw_hash=db.StringProperty(required=True)
	email=db.StringProperty()

	@classmethod
	def by_id(cls, uid):
		return User.get_by_id(uid)

	@classmethod
	def by_name(cls,name):
		u=[]
		users=db.GqlQuery("SELECT * FROM User")
		for user in users:
			#user.delete()
			if user.name==name:
				u.append(user)
		return u
	
	@classmethod
	def register(cls,name,pw,email=None):
		pw_hash=make_pw_hash(name,pw)
		return User(name=name,
			pw_hash=pw_hash,
			email=email)
	
	@classmethod
	def login(cls,name,pw):
		u=cls.by_name(name)
		if u and valid_pw(name,pw,u.pw_hash):
			return u

class MainPage(Handlar):
	def render_front(self):
		blogs=db.GqlQuery("SELECT * FROM Blog ORDER BY created DESC LIMIT 10")
		self.render("page.html",blogs=blogs)

	def get(self):
		self.render_front()

class NewPostPage(Handlar):
	def get(self):
		self.render("newpost.html",subject="",blog="",error="")
	
	def post(self):
		subject=self.request.get("subject")
		blog=self.request.get("blog")

		if subject and blog:
			b=Blog(subject=subject,blog=blog)
			b.put()
			self.redirect('/myblog/%s' %str(b.key().id()))
		
		else:
			self.render("newpost.html",subject=subject,blog=blog,error="There must be a subject and a blog.")

class PostedPage(Handlar):
	def get(self,post_id):
		key=db.Key.from_path('Blog',int(post_id))

		blog=db.get(key)

		if not blog:
			self.error(404)
			return
		
		self.render("permalink.html",blog=blog)

class SignUp(Handlar):
	def get(self):
		self.render("signup.html",name="",error_username="",error_password="",error_verify="",error_email="")
	
	def post(self):
		user_name=self.request.get("username")
		user_password=self.request.get("password")
		user_verify=self.request.get("verify")
		user_email=self.request.get("email")
		
		
		NAME_RE=re.compile(r"^[a-zA-Z0-9_-]{3,20}$")
		PASSWORD_RE=re.compile(r"^.{3,20}$")
		EMAIL_RE=re.compile(r"^[\S]+@[\S]+.[\S]+$")
		
		def valid_username(username):
			return NAME_RE.match(username)
		
		def valid_password(password):
			return PASSWORD_RE.match(password)
		
		def valid_email(email):
			return EMAIL_RE.match(email)
		
		# check whether input is valid
		if user_name and valid_username(user_name):
			error_username=""
		else:
			error_username="That's not a valid username."
		
		error_verify=""
		if user_password and valid_password(user_password):
			error_password=""
			if user_password!=user_verify:
				error_verify="Your passwords didn't match."
		else:
			error_password="That wasn't a valid password."
		
		if user_email and not valid_email(user_email):
			error_email="That's not a valid email."
		else:
			error_email=""
				
		
		if not error_username and not error_password and not error_verify:
			#check whether username is used
			u= User.by_name(user_name)
			if u:
				error_username="This username exists."
				self.render("signup.html",
					error_username=error_username,
				   )
			else:
				
				user=User.register(user_name,user_password,user_email)
				user.put()

				self.login(user)
			self.redirect('/myblog/welcome')
		else:
			self.render("signup.html",name=user_name,
				error_username=error_username,
				error_password=error_password,
				error_verify=error_verify,
				error_email=error_email)  

class WelcomePage(Handlar):
	def get(self):
		user_id=self.read_secure_cookie('user_id')
		if user_id:
			users=db.GqlQuery("SELECT * FROM User")
			rendered=False

			for user in users:
				if user_id==str(user.key().id()):
					self.render("welcome.html",name=user.name)
					rendered=True
					break
			if not rendered:
				self.redirect('/myblog/signup')
		else:
			self.redirect('/myblog/signup')

class SignIn(Handlar):
	def get(self):
		self.render("signin.html",name="",error="")
	
	def post(self):
		name=self.request.get("username")
		pw=self.request.get("password")

		u=User.by_name(name)
		if u:
			user=u[0]
			if valid_pw(name, pw, user.pw_hash):
				self.login(user)
				self.redirect('/myblog/welcome')
			else:
				self.render("signin.html",name=name,error="The name and password are not valid.")
				
		else:
			self.render("signin.html",name=name,
                error="The name and password are not valid. Please try again.")


app = webapp2.WSGIApplication([('/myblog',MainPage),
	('/myblog/newpost',NewPostPage),
	('/myblog/signup',SignUp),
	('/myblog/([0-9]+)',PostedPage),
	('/myblog/welcome',WelcomePage),
	('/myblog/signin',SignIn)],debug=True)