var Cat = function(data){
	this.clickCount=ko.observable(data.clickCount);
	this.name=ko.observable(data.name);
	this.imgSrc=ko.observable(data.imgSrc);
	this.nickName=ko.observableArray(data.nickName)
	
	this.level= ko.computed(function(){
		if (this.clickCount()<10){
			return "Newborn";
		}else if(this.clickCount() <50){
			return "Infant";
		}else if (this.clickCount()<120){
			return "Teen";
		}else if (this.clickCount()<300){
			return "Adult";
		}else{
			return "Old";
		}
	}, this);
	
	
}

var initialCats = [
		{
            clickCount : 0,
			id: 0,
            name : 'Tabby',
            imgSrc : 'i/first_cat.jpg',
			nickName: ['Tab', 'Baby'],
        },
        {
            clickCount : 0,
			id: 1,
            name : 'Tiger',
            imgSrc : 'i/second_cat.jpg',
			nickName: ['Tigger'],
        },
        {
            clickCount : 0,
			id: 2,
            name : 'Scaredy',
            imgSrc : 'i/third_cat.jpg',
			nickName: ['Scard']
        },
        {
            clickCount : 0,
			id: 3,
            name : 'Shadow',
            imgSrc : 'i/fourth_cat.jpg',
			nickName: ['Shadwalk']
        },
        {
            clickCount : 0,
			id: 4,
            name : 'Sleepy',
            imgSrc : 'i/fifth_cat.jpg',
			nickName: ['Sleep']
        }

]



var ViewModel= function(){
	var self=this;
		
	this.catList=ko.observableArray([]);
		
	initialCats.forEach(function(catItem){
		self.catList.push(new Cat(catItem));
	});
	
	this.currentCat=ko.observable(this.catList()[0]);
	
	this.incrementCounter = function() {
		self.currentCat().clickCount(self.currentCat().clickCount()+1);
	};
	
	this.setCurrentCat = function(){
		self.currentCat(this);
	}
}

ko.applyBindings(new ViewModel())