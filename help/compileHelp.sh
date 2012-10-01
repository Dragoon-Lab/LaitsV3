#!/bin/sh

cd helphs

java -cp ../../documentationhelpsrc MergeHTMLDocumentsToOne < helpHTMLfiles > allHelpInOne.html
