// Create local untracked collections
Percentages = new Mongo.Collection(null);
Loadings = new Mongo.Collection(null);

Template.barloading.helpers({
    percents: function() {
        return Percentages.find();
    },
    loading: function() {
        return Loadings.find();
    },
    targetWeight: function() {
        return this.targetWeight.toFixed(2);
    },
    barLoad: function() {
        var bar = '===';
        
        // Store amount of plates
        var p = [this.p45, this.p35, this.p25, this.p15,
                      this.p10, this.p5, this.p2];
        // Store plate representations
        var r = ['[45]','[35]','[25]','[15]','[10]','[5]','[2.5]'];
        
        // Build Bar string, two plates at a time
        for (var i = 0; i < 7; i++) {
            while (p[i] > 0) {
                bar = r[i] + bar + r[i];
                p[i] -= 2;
            }
        }
        return bar;
    }
});

Template.barloading.events({
    'click #addPercent': function(e) {
        var percentage = $('#percent').val();
        Percentages.insert({
            percent: percentage
        });
    },
    'keyup #percent': function(e) {
        if (e.which === 13) {
            var percentage = $('#percent').val();
            Percentages.insert({
                percent: percentage
            });
        }
    },
    'click #percentList li': function() {
        Percentages.remove(this._id);
    },
    'click #calculate': function() {
        // Clear Loadings collection
        Loadings.remove({});
        
        // Get values from form
        var oneRepMax = $('#oneRepMax').val();
        var barWeight = $('#barWeight').val();

        var loadWeight;

        // Calculate loading for each percentage
        Percentages.find().forEach(function(obj) {
            var loading = {
                p45: 0,
                p35: 0,
                p25: 0,
                p15: 0,
                p10: 0,
                p5: 0,
                p2: 0
            };
            loading.targetWeight = (oneRepMax * (obj.percent / 100));
            loading.percent = obj.percent;
            loadWeight = loading.targetWeight - barWeight;

            // Use greedy algorithm for building bar
            if (loadWeight % 5 > 2.5) {
                loadWeight += 5;
            }
            while (loadWeight >= 5) {
                if (loadWeight >= 90) {
                    loading.p45 += 2;
                    loadWeight -= 90;
                    continue;
                }
                else if (loadWeight >= 70) {
                    loading.p35 += 2;
                    loadWeight -= 70;
                    continue;
                }
                else if (loadWeight >= 50) {
                    loading.p25 += 2;
                    loadWeight -= 50;
                    continue;
                }
                else if (loadWeight >= 30) {
                    loading.p15 += 2;
                    loadWeight -= 30;
                    continue;
                }
                else if (loadWeight >= 20) {
                    loading.p10 += 2;
                    loadWeight -= 20;
                    continue;
                }
                else if (loadWeight >= 10) {
                    loading.p5 += 2;
                    loadWeight -= 10;
                    continue;
                }
                else {
                    loading.p2 += 2;
                    loadWeight -= 5;
                    continue;
                }
            }
            // Calculate actual loaded weight
            loading.actualWeight = Number(barWeight) +
                                   Number(loading.p45 * 45.0) +
                                   Number(loading.p35 * 35.0) +
                                   Number(loading.p25 * 25.0) +
                                   Number(loading.p15 * 15.0) +
                                   Number(loading.p10 * 10.0) +
                                   Number(loading.p5  *  5.0) +
                                   Number(loading.p2  *  2.5);

            // Insert into loadings collection
            Loadings.insert(loading);
        });

    }
});