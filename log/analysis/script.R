#Dragoon Project
#Arizona State University
#(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
#
#This file is a part of Dragoon
#Dragoon is free software: you can redistribute it and/or modify
#it under the terms of the GNU Lesser General Public License as published by
#the Free Software Foundation, either version 3 of the License, or
#(at your option) any later version.
#
#Dragoon is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU Lesser General Public License for more details.
#
#You should have received a copy of the GNU Lesser General Public License
#along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.

############################    README   ###################################
#This file analysis the pre post test results for ATI evaluation and also the work done by the user which comes from the dashboard.
#The files it uses for those purpose are text files which can be given as input to read.table commands in first 6 lines of the file.
#The files are named - tests_tutor and tests_editor which gives a table of test results both post and pre. 
#Important column names are "post" for post test marks and "pre" for pre test marks.
#Files which give the user work details are named complete_tutor.txt and complete_editor for tutor and control condition.
#The important column names are prob_started, prob_completed and total_time.
#To run this just copy and paste the script in the folder which has the file. Open R in that folder and type the command - source("script.R")
#It will give two images in the folder for ATI interaction, linear model details on the console and some ANCOVA results as well. 
#The calls to specific models and results can be read on the console.
#############################################################################

#require(gdata)
##clearing work space
rm(list = ls())

y_tutor = read.table("tests_tutor.txt", header = TRUE)
y_editor = read.table("tests_editor.txt", header = TRUE)

x_tutor = read.table("complete_tutor.txt", header = TRUE)
x_editor = read.table("complete_editor.txt", header = TRUE)

#linear regression between pre and post test results
lm.tutor_y = lm(y_tutor$post ~ y_tutor$pre)
print(summary(lm.tutor_y))

lm.editor_y = lm(y_editor$post ~ y_editor$pre)
print(summary(lm.editor_y))


complete_y = rbind(y_tutor, y_editor)
complete_x = rbind(x_tutor, x_editor)
pre_range = range(complete_y$pre)
post_range = range(complete_y$post)

#printing result to image for ATI
png(filename="pre_post_analysis_ATI.png", height=500, width=500, bg = "white") 
plot(y_tutor$pre, y_tutor$post, col="red", main="ATI Pre vs Post//Control(blue) and Tutor(Red)", xlab = "Pretest", ylab="Posttest", ylim=post_range, xlim=pre_range)
points(y_editor$pre, y_editor$post, col="blue")
abline(lm.tutor_y, col="red")
abline(lm.editor_y, col="blue")
dev.off()

#linear regression for post time with post test scores 
lm.tutor_time = lm(y_tutor$post ~ x_tutor$total_time)
print(summary(lm.tutor_time))

lm.editor_time = lm(y_editor$post ~ x_editor$total_time)
print(summary(lm.editor_time))

time_range = range(complete_x$total_time)
png(filename="post_total_time.png", height=500, width = 500, bg="white")
plot(x_tutor$total_time, y_tutor$post, col="red", main="Total Time vs Post//Control(blue) and Tutor(Red)", xlab = "Total time spent", ylab="Posttest", ylim=post_range, xlim=time_range)
points(x_editor$total_time, y_editor$post, col="blue")
abline(lm.tutor_time, col="red")
abline(lm.editor_time, col="blue")
dev.off()

#linear regression on post agains pre and total time and covariance variable as well
lm.tutor = lm(y_tutor$post ~ y_tutor$pre + x_tutor$total_time)
print(summary(lm.tutor))
	
lm.editor = lm(y_editor$post ~ y_editor$pre + x_editor$total_time)
print(summary(lm.editor))

lm.tutor_interaction = lm(y_tutor$post ~ y_tutor$pre + x_tutor$total_time + (y_tutor$pre)*(x_tutor$total_time))
print(summary(lm.tutor_interaction))

lm.editor_interaction = lm(y_editor$post ~ y_editor$pre + x_editor$total_time + (y_editor$pre)*(x_editor$total_time))
print(summary(lm.editor_interaction))

## ANCOVA analysis
y_tutor[, "mode"] <- rep("TUTOR", nrow(y_tutor))
y_editor[, "mode"] <- rep("EDITOR", nrow(y_editor))
x_tutor[, "mode"] <- rep("TUTOR", nrow(x_tutor))
x_editor[, "mode"] <- rep("EDITOR", nrow(y_editor))

x_tutor[, "dill_time_m"] <- x_tutor$total_time >= mean(x_tutor$total_time)
x_editor[, "dill_time_m"] <- x_editor$total_time >= mean(x_editor$total_time)

complete_y <- rbind(y_tutor, y_editor)
complete_x <- rbind(x_tutor, x_editor)

complete_y[, "dill_time"] <- complete_x$total_time >= mean(complete_x$total_time)
complete_y[, "dill_prob_started"] <- complete_x$prob_started >= mean(complete_x$prob_started)
complete_y[, "dill_time_m"] <- complete_x$dill_time_m

aov.mode <- aov(complete_y$post ~ complete_y$pre + complete_y$mode)
print(summary(aov.mode))

aov.mode_time <- aov(complete_y$post ~ complete_y$pre + complete_y$mode + complete_y$dill_time)
print(summary(aov.mode_time))

aov.time <- aov(complete_y$post ~ complete_y$pre + complete_y$dill_time)
print(summary(aov.time))
